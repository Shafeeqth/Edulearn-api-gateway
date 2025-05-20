import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./dev-config";

const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.accessSecret,
  },
});

export default s3Client;
