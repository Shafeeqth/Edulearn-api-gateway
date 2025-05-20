import { config } from "../config";
import { IStorageService } from "./interfaces/storage.inteface";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import s3Client from "config/aws.s3.config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service implements IStorageService {
  constructor(private bucketName: string = config.s3.bucketName) {}

  public async uploadFile(
    key: string,
    body: Buffer,
    contentType: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return key;
  }

  public async getFileUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: expiresIn });
  }

  public async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await s3Client.send(command);
  }

  public async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    return response.Body as NodeJS.ReadableStream;
  }
}
