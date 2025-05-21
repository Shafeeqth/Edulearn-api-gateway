import dotenv from "dotenv";
dotenv.config({ encoding: "utf-8", debug: true, path: ".env" });

export const config = {
  port: (process.env.PORT as string) || 3000,
  redisUrl: process.env.REDIS_URL as string,
  serviceName: process.env.SERVICE_NAME as string,
  lokiUrl: process.env.LOKI_URL as string,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY as string,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY as string,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,
  nodeEnv: process.env.NODE_ENV as string,
  grpcServices: {
    userService: process.env.USER_SERVICE_GRPC || "localhost:50051",
    courseService: process.env.COURSE_SERVICE_GRPC || "localhost:50052",
    sessionService: process.env.SESSION_SERVICE_GRPC || "localhost:50053",
    notificationService:
      process.env.NOTIFICATION_SERVICE_GRPC || "localhost:50054",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_CLOUD_KEY,
    apiSecret: process.env.CLOUDINARY_CLOUD_SECRET,
  },
  s3: {
    region: process.env.AWS_S3_REGION!,
    accessKey: process.env.AWS_S3_API_KEY!,
    accessSecret: process.env.AWS_S3_API_SECRET!,
    bucketName: process.env.AWS_S3_BUCKET_NAME!,
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || "edulearn-api-gateway",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    ssl: process.env.KAFKA_SSL === "true",
    sals: {
      mechanism: "plain",
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD,
    },
  },
};
