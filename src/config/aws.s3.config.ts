import { S3Client } from '@aws-sdk/client-s3';
import { config as appConfig } from './dev-config';

const createS3Client = (): S3Client => {
  const config: any = {
    region: process.env.AWS_REGION || 'us-east-1',
    maxAttempts: 3,
    requestHandler: {
      requestTimeout: 30000,
      httpsAgent: {
        maxSockets: 50,
      },
    },
  };

  // Use IAM roles in production, explicit credentials in development
  if (appConfig.nodeEnv === 'development' && appConfig.s3.accessKey) {
    config.credentials = {
      accessKeyId: appConfig.s3.accessKey,
      secretAccessKey: appConfig.s3.accessSecret!,
    };
  }

  return new S3Client(config);
};

export const s3Client = createS3Client();
