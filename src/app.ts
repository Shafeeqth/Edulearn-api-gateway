import express, { Application } from 'express';
import { routerV1 } from './routes/v1';
import { errorHandler } from './shared/utils/errorHandler';
import cors from 'cors';
import { corsOptions } from './shared/utils/cors';
import { helmetSecurity } from './middlewares/security.helmet';
import cookieParser from 'cookie-parser';
import { rateLimiter } from './middlewares/rate-limiter.middleware';
import { KafkaProducerService } from './services/messaging/kafka/producer.service';
import { UserBlockService } from './services/user-blocklist.service';
import { initializeTracer } from './services/observability/tracing/setup';
import { observabilityMiddleware } from './middlewares/observability.middleware';
import { metricsRouter } from './routes/monitoring.route';
import { compress } from './middlewares/compression';
import { LoggingService } from './services/observability/logging/logging.service';
import { RedisService } from './shared/utils/redis';
import { BloomFilterFacade } from './services/bloom-filter';
import { Retry, withRetry } from './shared/utils/retryable';

export class App {
  private server: Application;
  private kafkaProducer?: KafkaProducerService;
  private isShuttingDown = false;
  private logger: LoggingService;
  private redis: RedisService;

  constructor() {
    this.server = express();
    this.logger = LoggingService.getInstance();
    this.redis = RedisService.getInstance();
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing API Gateway...');

      // Initialize tracing first
      initializeTracer();

      // Initialize external services
      await this.setupRedis();
      await this.setupUtils();

      // Register middleware in optimal order
      this.registerMiddleware();

      // Register routes and health checks
      this.registerHealthCheck();
      this.registerLivenessCheck();
      this.registerRoutes();
      this.registerErrorHandler();
      this.setupGlobalErrorHandlers();

      // await this.setupKafkaProducer();
      this.listen();

      this.logger.info('API Gateway initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize application', { error });
      throw error;
    }
  }

  private registerMiddleware(): void {
    // 1. Security middleware (first line of defense)
    this.server.use(helmetSecurity);
    this.server.use(cors(corsOptions));

    // 2. Request parsing middleware
    this.server.use(
      express.json({
        limit: '50mb',
        verify: (req, res, buf) => {
          // Store raw body for signature verification if needed
          (req as any).rawBody = buf;
        },
      })
    );
    this.server.use(
      express.urlencoded({
        extended: true,
        limit: '50mb',
      })
    );
    this.server.use(cookieParser());

    // 3. Compression middleware (before observability to capture compressed size)
    this.server.use(compress);

    // 4. Observability middleware (after parsing, before business logic)
    this.server.use(observabilityMiddleware);

    // 5. Rate limiting (after observability, before business logic)
    this.server.use(
      rateLimiter({
        points: parseInt(process.env.RATE_LIMIT_POINTS || '100'),
        duration: parseInt(process.env.RATE_LIMIT_DURATION || '60'),
      })
    );

    // 6. Trust proxy for accurate IP addresses
    this.server.set('trust proxy', 1);

    // 7. Disable powered-by header
    this.server.disable('x-powered-by');

    // 8. Set security headers
    this.server.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });
  }

  private registerHealthCheck(): void {
    this.server.get('/health', (req, res) => {
      (async () => {
        if (this.isShuttingDown) {
          return res.status(503).json({
            status: 'shutting_down',
            timestamp: new Date().toISOString(),
          });
        }

        const results: Record<string, any> = {};
        const startTime = Date.now();

        // Redis check
        try {
          const redisStart = Date.now();
          await this.redis.getClient().ping();
          const redisDuration = Date.now() - redisStart;
          results.redis = {
            healthy: true,
            duration: redisDuration,
            status: 'connected',
          };
        } catch (e) {
          results.redis = {
            healthy: false,
            error: (e as Error).message,
            status: 'disconnected',
          };
        }

        // Memory usage check
        const memUsage = process.memoryUsage();
        results.memory = {
          healthy: memUsage.heapUsed < 500 * 1024 * 1024, // 500MB threshold
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
          rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
        };

        // CPU usage check
        const cpuUsage = process.cpuUsage();
        results.cpu = {
          user: Math.round(cpuUsage.user / 1000) + 'ms',
          system: Math.round(cpuUsage.system / 1000) + 'ms',
        };

        // Kafka check (uncomment and implement if needed)
        // try {
        //   await this.kafkaProducer?.isHealthy();
        //   results.kafka = { healthy: true };
        // } catch (e) {
        //   results.kafka = { healthy: false, error: (e as Error).message };
        // }

        const allHealthy = Object.values(results).every(
          dep => dep.healthy !== false
        );
        const totalDuration = Date.now() - startTime;

        return res.status(allHealthy ? 200 : 503).json({
          status: allHealthy ? 'ok' : 'unhealthy',
          timestamp: new Date().toISOString(),
          duration: totalDuration,
          version: process.env.npm_package_version || '1.0.0',
          uptime: process.uptime(),
          dependencies: results,
        });
      })().catch(err => {
        res.status(500).json({
          status: 'error',
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: err instanceof Error ? err.message : 'Unknown error',
          },
        });
      });
    });
  }

  private registerLivenessCheck(): void {
    this.server.get('/live', (req: express.Request, res: express.Response) => {
      (async () => {
        if (this.isShuttingDown) {
          return res.status(503).send('Shutting down');
        }
        return res.status(200).send('OK');
      })().catch(() => {
        return res.status(500).send('Internal error');
      });
    });
  }

  private registerRoutes(): void {
    try {
      // API routes
      this.server.use('/api/v1', routerV1);

      // Metrics endpoint
      this.server.use(metricsRouter);

      // // 404 handler
      // this.server.use('*', (req, res) => {
      //   res.status(404).json({
      //     status: 'error',
      //     error: {
      //       code: 'NOT_FOUND',
      //       message: `Route ${req.method} ${req.originalUrl} not found`,
      //     },
      //   });
      // });
    } catch (error) {
      this.logger.error('Error registering routes', { error, ctx: App.name });
      throw error;
    }
  }

  private registerErrorHandler(): void {
    this.server.use(errorHandler);
  }

  private async setupRedis(): Promise<void> {
    try {
      await this.redis.connect();
      this.logger.info('Redis connected successfully', { ctx: App.name });
    } catch (error) {
      this.logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Rejection at:', {
        promise,
        reason,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      this.logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack,
      });

      // Don't exit immediately, give time for cleanup
      // setTimeout(() => {
      //   process.exit(1);
      // }, 1000);
    });
  }

  private async setupUtils(): Promise<void> {
    try {
      // new UserBlockService(redisClient.getClient());

      this.logger.info('User block service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize user block service', { error });
      throw error;
    }

    try {
      const bloomFilterService = BloomFilterFacade.getInstance(this.redis);
      withRetry(
        async () => {
          await bloomFilterService.initialize();

          this.logger.info('BloomFilter service initialized');
        },
        {
          onRetry: (error, attempt, delay) => {
            console.log(
              `Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms`
            );
          },
        }
      );
    } catch (error) {
      this.logger.error('Failed to initialize BloomFilter service', { error });
      throw error;
    }
  }

  // private async setupKafkaProducer(): Promise<void> {
  //   this.kafkaProducer = new KafkaProducerService();
  //   try {
  //     await this.kafkaProducer.connect();
  //   } catch (error) {
  //     console.error("Failed to connect Kafka producer :)", error);
  //     process.exit(1);
  //   }
  // }

  private listen(): void {
    const PORT = process.env.PORT || 4000;
    const server = this.server.listen(PORT, () => {
      this.logger.info('API Gateway listening', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
      });
    });

    // Handle server errors
    server.on('error', error => {
      this.logger.error('Server error', { error });
    });

    // Graceful shutdown for server
    process.on('SIGTERM', () => {
      this.logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        this.logger.info('Server closed');
        this.shutdown();
      });
    });
  }

  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    this.logger.info('Shutting down API Gateway...');

    try {
      // Close Redis connection
      await this.redis.disconnect();
      this.logger.info('Redis disconnected');

      // Close Kafka producer if exists
      // await this.kafkaProducer?.disconnect();

      this.logger.info('API Gateway shutdown completed');
    } catch (error) {
      this.logger.error('Error during shutdown', { error });
    }
  }
}
