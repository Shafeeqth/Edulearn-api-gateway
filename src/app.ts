import express, { Application } from "express";
import { routerV1 } from "./routes/v1";
import { errorHandler } from "./utils/errorHandler";
import cors from "cors";
import { corsOptions } from "./utils/cors";
import { helmetSecurity } from "./middlewares/security.helmet";
import cookieParser from "cookie-parser";
import redisClient from "./utils/redis";
import { rateLimiter } from "./middlewares/rate-limiter.middleware";
import { KafkaProducerService } from "./services/messaging/kafka/producer.service";
import { UserBlockService } from "./services/user-blocklist.service";

export class App {
  private server: Application;
  private kafkaProducer: KafkaProducerService;
  constructor() {
    this.server = express();
  }

  async initialize(): Promise<void> {
    await this.setupRedis();
    await this.setupUtils();
    this.registerMiddleware();
    this.registerRoutes();
    this.registerErrorHandler();
    // await this.setupKafkaProducer();
    this.listen();
  }

  private registerMiddleware(): void {
    this.server.use(cors(corsOptions));
    this.server.use(helmetSecurity);
    this.server.use(express.json({ limit: "50mb" }));
    this.server.use(express.urlencoded({ extended: true }));
    this.server.use(cookieParser());
    this.server.use(rateLimiter({ points: 10, duration: 60 }));
  }

  private registerRoutes(): void {
    this.server.use("/api/v1", routerV1);
  }
  private registerErrorHandler(): void {
    this.server.use(errorHandler);
  }

  private async setupRedis(): Promise<void> {
    await redisClient.connect();
  }

  private async setupUtils(): Promise<void> {
    new UserBlockService(redisClient.getClient());
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
    this.server.listen(PORT, () => {
      console.info("api-gateway listen at :) ", PORT);
    });
  }

  async shutdown(): Promise<void> {
    await redisClient.disconnect();
    // await this.kafkaProducer.disconnect();
    console.log("shutting down server :)");
  }
}
