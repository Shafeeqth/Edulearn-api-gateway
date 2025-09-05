import dotenv from 'dotenv';

// Only enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ debug: true });
} else {
  dotenv.config();
}

export const config = {
  port: (process.env.PORT as string) || 4000,
  redisUrl: process.env.REDIS_URL as string,
  serviceName: process.env.SERVICE_NAME as string,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY as string,
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY as string,
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
  nodeEnv: process.env.NODE_ENV as string,
  grpcServices: {
    authService: process.env.AUTH_SERVICE_GRPC || 'localhost:50051',
    userServiceClient: process.env.USER_SERVICE_GRPC || 'localhost:50052',
    courseService: process.env.COURSE_SERVICE_GRPC || 'localhost:50053',
    paymentService: process.env.PAYMENT_SERVICE_GRPC || 'localhost:50055',
    orderService: process.env.ORDER_SERVICE_GRPC || 'localhost:50054',
    sessionService: process.env.SESSION_SERVICE_GRPC || 'localhost:50057',
    notificationService:
      process.env.NOTIFICATION_SERVICE_GRPC || 'localhost:50056',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  s3: {
    region: process.env.AWS_S3_REGION!,
    accessKey: process.env.AWS_S3_API_KEY!,
    accessSecret: process.env.AWS_S3_API_SECRET!,
    bucketName: process.env.AWS_S3_BUCKET_NAME!,
    secureBucketName: process.env.AWS_S3_SECURE_BUCKET_NAME!,
    secureAccessKey: process.env.AWS_S3_SECURE_API_KEY!,
    secureAccessSecret: process.env.AWS_S3_SECURE_API_SECRET!,
    secureRegion: process.env.AWS_S3_SECURE_REGION!,
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'edulearn-api-gateway',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    ssl: process.env.KAFKA_SSL === 'true',
    sals: {
      mechanism: 'plain',
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD,
    },
  },
  observability: {
    jaeger: {
      endpoint: process.env.JAEGER_ENDPOINT,
      port: process.env.JAEGER_PORT,
      host: process.env.JAEGER_HOST,
      samplingRate: process.env.JAEGER_SAMPLING_RATE,
    },
    prometheus: {
      port: process.env.JAEGER_PORT,
      path: process.env.PROMETHEUS_PATH,
    },
    loki: {
      url: process.env.LOKI_URL,
    },
    logger: {
      logLevel: process.env.LOG_LEVEL,
    },
  },
  cors:{
     allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:9000"],
     allowedMethods: process.env.ALLOWED_METHODS?.split(",") || ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  }
};
