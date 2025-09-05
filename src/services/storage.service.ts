import {
  S3Client,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { LoggingService } from './observability/logging/logging.service';
import { config } from '@/config';

const logger = LoggingService.getInstance();
export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  maxRetries: number;
  timeout: number;
}

export interface FileMetadata {
  courseId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadId?: string;
  checksum?: string;
  tags?: Record<string, string>;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expires: number;
  uploadId?: string;
}

export interface MultipartUploadResult {
  uploadId: string;
  fileUrl: string;
  key: string;
  parts: Array<{
    partNumber: number;
    uploadUrl: string;
    expires: number;
  }>;
}

export interface CompletedPart {
  partNumber: number;
  etag: string;
}

export interface UploadedPart {
  partNumber: number;
  etag: string;
  size: number;
  lastModified: Date;
}

export interface ListPartsResult {
  parts: UploadedPart[];
  isTruncated: boolean;
  nextPartNumberMarker?: number;
}

export interface CompleteMultipartResult {
  url: string;
  location: string;
  etag: string;
}

class S3StorageService {
  private s3Client: S3Client;
  private s3SecureClient: S3Client;
  private config: S3Config;
  private secureConfig: S3Config;

  constructor(config: S3Config, secureConfig: S3Config) {
    this.config = config;
    this.secureConfig = secureConfig;

    const clientConfig: any = {
      region: config.region,
      maxAttempts: config.maxRetries,
      requestHandler: {
        requestTimeout: config.timeout,
        httpsAgent: {
          maxSockets: 50,
          keepAlive: true,
        },
      },
    };
    const secureClientConfig: any = {
      region: secureConfig.region,
      maxAttempts: secureConfig.maxRetries,
      requestHandler: {
        requestTimeout: secureConfig.timeout,
        httpsAgent: {
          maxSockets: 50,
          keepAlive: true,
        },
      },
    };

    // Use explicit credentials if provided, otherwise use IAM roles
    if (config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }
    if (secureConfig.accessKeyId && secureConfig.secretAccessKey) {
      secureClientConfig.credentials = {
        accessKeyId: secureConfig.accessKeyId,
        secretAccessKey: secureConfig.secretAccessKey,
      };
    }

    this.s3Client = new S3Client(clientConfig);
    this.s3SecureClient = new S3Client(secureClientConfig);

    logger.debug('S3StorageService initialized', {
      region: config.region,
      bucket: config.bucket + ', ' + secureConfig.region,
      usingExplicitCredentials: !!(
        config.accessKeyId && config.secretAccessKey
      ),
    });
  }

  /**
   * Generate a unique S3 key for the file
   */
  private generateFileKey(metadata: FileMetadata): string {
    const sanitizedFileName = this.sanitizeFileName(metadata.fileName);
    const timestamp = new Date().toISOString().split('T')[0];
    const uniqueId = uuidv4();
    const fileExtension =
      metadata.fileName.split('.').pop()?.toLowerCase() || '';

    return `courses/${metadata.courseId}/users/${metadata.userId}/${timestamp}/${uniqueId}/${sanitizedFileName}.${fileExtension}`;
  }

  /**
   * Sanitize filename for S3 compatibility
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 200);
  }

  /**
   * Prepare metadata for S3 object
   */
  private prepareS3Metadata(
    metadata: FileMetadata,
    additionalMetadata?: Record<string, string>
  ): Record<string, string> {
    const s3Metadata: Record<string, string> = {
      'course-id': metadata.courseId,
      'user-id': metadata.userId,
      'original-name': metadata.fileName,
      'upload-timestamp': new Date().toISOString(),
      'file-size': metadata.fileSize.toString(),
      'file-type': metadata.fileType,
    };

    if (metadata.checksum) {
      s3Metadata['client-checksum'] = metadata.checksum;
    }
    if (metadata.uploadId) {
      s3Metadata['upload-id'] = metadata.uploadId;
    }

    if (metadata.tags) {
      Object.entries(metadata.tags).forEach(([key, value]) => {
        s3Metadata[`tag-${key}`] = value;
      });
    }

    if (additionalMetadata) {
      Object.entries(additionalMetadata).forEach(([key, value]) => {
        s3Metadata[key] = value;
      });
    }

    return s3Metadata;
  }

  /**
   * Generate presigned URL for regular upload (files < 100MB)
   */
  async generatePresignedUploadUrl(
    metadata: FileMetadata,
    expiresIn: number = 3600
  ): Promise<PresignedUploadResult> {
    try {
      const key = this.generateFileKey(metadata);
      const s3Metadata = this.prepareS3Metadata(metadata);

      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ContentType: metadata.fileType,
        // ContentLength: metadata.fileSize,
        // Metadata: s3Metadata,
        // ServerSideEncryption: 'AES256',
        // ChecksumAlgorithm: 'SHA256',
        // CacheControl: 'max-age=31536000', // 1 year
        // ContentDisposition: `attachment; filename="${metadata.fileName}"`,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      const fileUrl = `https://${config.s3.bucketName}.s3.${config.s3.region}.amazonaws.com/${key}`;

      const result: PresignedUploadResult = {
        uploadUrl,
        fileUrl,
        key,
        expires: Date.now() + expiresIn * 1000,
        uploadId: metadata.uploadId,
      };

      logger.debug('Generated presigned upload URL', {
        uploadId: metadata.uploadId,
        key,
        fileSize: metadata.fileSize,
        expiresIn,
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to generate presigned upload URL', {
        error: error.message,
        uploadId: metadata.uploadId,
        fileSize: metadata.fileSize,
      });
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }
  /**
   * Generate presigned URL for regular upload (files < 100MB)
   */
  async generateSecurePresignedUploadUrl(
    metadata: FileMetadata,
    expiresIn: number = 3600
  ): Promise<PresignedUploadResult> {
    try {
      const key = this.generateFileKey(metadata);
      const s3Metadata = this.prepareS3Metadata(metadata);

      const command = new PutObjectCommand({
        Bucket: this.secureConfig.bucket,
        Key: key,
        ContentType: metadata.fileType,
        // ContentLength: metadata.fileSize,
        // Metadata: s3Metadata,
        // ServerSideEncryption: 'AES256',
        // ChecksumAlgorithm: 'SHA256',
        // CacheControl: 'max-age=31536000', // 1 year
        // ContentDisposition: `attachment; filename="${metadata.fileName}"`,
      });

      const uploadUrl = await getSignedUrl(this.s3SecureClient, command, {
        expiresIn,
      });

      const fileUrl = `https://${config.s3.secureBucketName}.s3.${config.s3.secureRegion}.amazonaws.com/${key}`;

      const result: PresignedUploadResult = {
        uploadUrl,
        fileUrl,
        key,
        expires: Date.now() + expiresIn * 1000,
        uploadId: metadata.uploadId,
      };

      logger.debug('Generated presigned upload URL', {
        uploadId: metadata.uploadId,
        key,
        fileSize: metadata.fileSize,
        expiresIn,
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to generate presigned upload URL', {
        error: error.message,
        uploadId: metadata.uploadId,
        fileSize: metadata.fileSize,
      });
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  async getSignedSecureCourseUrl(key: string) {
    const GET_EXPIRY_TIME = 60 * 10; // 10 Minutes

    const command = new GetObjectCommand({
      Bucket: this.secureConfig.bucket,
      Key: key,
    });
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: GET_EXPIRY_TIME,
    }); // expires in 60s

    return { url };
  }

  /**
   * Initialize multipart upload for large files
   */
  async initializeMultipartUpload(
    metadata: FileMetadata,
    chunkSize: number,
    expiresIn: number = 3600
  ): Promise<MultipartUploadResult> {
    try {
      const key = this.generateFileKey(metadata);
      const s3Metadata = this.prepareS3Metadata(metadata, {
        'chunk-size': chunkSize.toString(),
        'multipart-upload': 'true',
      });

      // Create multipart upload
      const createCommand = new CreateMultipartUploadCommand({
        Bucket: this.secureConfig.bucket,
        Key: key,
        ContentType: metadata.fileType,
        Metadata: s3Metadata,
        ServerSideEncryption: 'AES256',
        CacheControl: 'max-age=31536000',
        ContentDisposition: `attachment; filename="${metadata.fileName}"`,
      });

      const createResponse = await this.s3SecureClient.send(createCommand);

      if (!createResponse.UploadId) {
        throw new Error('Failed to get upload ID from S3');
      }

      const uploadId = createResponse.UploadId;
      const totalParts = Math.ceil(metadata.fileSize / chunkSize);

      logger.debug('Initialized multipart upload', {
        uploadId: metadata.uploadId,
        s3UploadId: uploadId,
        key,
        totalParts,
        chunkSize,
        fileSize: metadata.fileSize,
      });

      // Generate presigned URLs for each part
      const parts = [];
      const expires = Date.now() + expiresIn * 1000;

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const uploadPartCommand = new UploadPartCommand({
          Bucket: this.secureConfig.bucket,
          Key: key,
          PartNumber: partNumber,
          UploadId: uploadId,
        });

        const partUploadUrl = await getSignedUrl(
          this.s3SecureClient,
          uploadPartCommand,
          {
            expiresIn,
          }
        );

        parts.push({
          partNumber,
          uploadUrl: partUploadUrl,
          expires,
        });
      }

      const fileUrl = `https://${this.secureConfig.bucket}.s3.${this.secureConfig.region}.amazonaws.com/${key}`;

      const result: MultipartUploadResult = {
        uploadId,
        fileUrl,
        key,
        parts,
      };

      logger.debug('Generated multipart upload URLs', {
        uploadId: metadata.uploadId,
        s3UploadId: uploadId,
        partsCount: parts.length,
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to initialize multipart upload', {
        error: error.message,
        uploadId: metadata.uploadId,
        fileSize: metadata.fileSize,
      });
      throw new Error(
        `Failed to initialize multipart upload: ${error.message}`
      );
    }
  }

  /**
   * Generate presigned URLs for additional parts (for resume functionality)
   */
  async generateAdditionalPartUrls(
    key: string,
    uploadId: string,
    partNumbers: number[],
    expiresIn: number = 3600
  ): Promise<
    Array<{ partNumber: number; uploadUrl: string; expires: number }>
  > {
    try {
      const parts = [];
      const expires = Date.now() + expiresIn * 1000;

      for (const partNumber of partNumbers) {
        const uploadPartCommand = new UploadPartCommand({
          Bucket: this.secureConfig.bucket,
          Key: key,
          PartNumber: partNumber,
          UploadId: uploadId,
        });

        const partUploadUrl = await getSignedUrl(
          this.s3SecureClient,
          uploadPartCommand,
          {
            expiresIn,
          }
        );

        parts.push({
          partNumber,
          uploadUrl: partUploadUrl,
          expires,
        });
      }

      logger.debug('Generated additional part URLs', {
        s3UploadId: uploadId,
        key,
        partNumbers,
        expiresIn,
      });

      return parts;
    } catch (error: any) {
      logger.error('Failed to generate additional part URLs', {
        error: error.message,
        uploadId,
        key,
        partNumbers,
      });
      throw new Error(
        `Failed to generate additional part URLs: ${error.message}`
      );
    }
  }

  /**
   * List uploaded parts for a multipart upload
   */
  async listUploadedParts(
    key: string,
    uploadId: string,
    maxParts: number = 1000,
    partNumberMarker?: number
  ): Promise<ListPartsResult> {
    try {
      const command = new ListPartsCommand({
        Bucket: this.secureConfig.bucket,
        Key: key,
        UploadId: uploadId,
        MaxParts: maxParts,
        PartNumberMarker: partNumberMarker?.toString(),
      });

      const response = await this.s3SecureClient.send(command);

      const parts: UploadedPart[] =
        response.Parts?.map(part => ({
          partNumber: part.PartNumber!,
          etag: part.ETag!.replace(/"/g, ''), // Remove quotes from ETag
          size: part.Size!,
          lastModified: part.LastModified!,
        })) || [];

      const result: ListPartsResult = {
        parts,
        isTruncated: response.IsTruncated || false,
        nextPartNumberMarker: parseInt(response.NextPartNumberMarker || ''),
      };

      logger.debug('Listed uploaded parts', {
        uploadId,
        key,
        partsCount: parts.length,
        isTruncated: result.isTruncated,
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to list uploaded parts', {
        error: error.message,
        uploadId,
        key,
      });
      throw new Error(`Failed to list uploaded parts: ${error.message}`);
    }
  }

  /**
   * Complete multipart upload
   */
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: CompletedPart[]
  ): Promise<CompleteMultipartResult> {
    try {
      // Sort parts by part number to ensure correct order
      const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);

      // Validate that we have all parts in sequence
      for (let i = 0; i < sortedParts.length; i++) {
        if (sortedParts?.[i]?.partNumber !== i + 1) {
          throw new Error(`Missing part ${i + 1} in multipart upload`);
        }
      }

      const command = new CompleteMultipartUploadCommand({
        Bucket: this.secureConfig.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: sortedParts.map(part => ({
            ETag: part.etag.startsWith('"') ? part.etag : `"${part.etag}"`, // Ensure ETag has quotes
            PartNumber: part.partNumber,
          })),
        },
      });

      const response = await this.s3SecureClient.send(command);

      if (!response.Location) {
        throw new Error(
          'Failed to get location from completed multipart upload'
        );
      }

      const result: CompleteMultipartResult = {
        url: `https://${this.secureConfig.bucket}.s3.${this.secureConfig.region}.amazonaws.com/${key}`,
        location: response.Location,
        etag: response.ETag?.replace(/"/g, '') || '',
      };

      logger.debug('Completed multipart upload', {
        uploadId,
        key,
        partsCount: parts.length,
        location: result.location,
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to complete multipart upload', {
        error: error.message,
        uploadId,
        key,
        partsCount: parts.length,
      });
      throw new Error(`Failed to complete multipart upload: ${error.message}`);
    }
  }

  /**
   * Abort multipart upload
   */
  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    try {
      const command = new AbortMultipartUploadCommand({
        Bucket: this.secureConfig.bucket,
        Key: key,
        UploadId: uploadId,
      });

      await this.s3SecureClient.send(command);

      logger.debug('Aborted multipart upload', {
        uploadId,
        key,
      });
    } catch (error: any) {
      logger.error('Failed to abort multipart upload', {
        error: error.message,
        uploadId,
        key,
      });
      throw new Error(`Failed to abort multipart upload: ${error.message}`);
    }
  }

  /**
   * Check if object exists in S3
   */
  async objectExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }

      logger.error('Failed to check if object exists', {
        error: error.message,
        key,
      });
      throw new Error(`Failed to check if object exists: ${error.message}`);
    }
  }
  async objectSecureExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.secureConfig.bucket,
        Key: key,
      });

      await this.s3SecureClient.send(command);
      return true;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }

      logger.error('Failed to check if object exists', {
        error: error.message,
        key,
      });
      throw new Error(`Failed to check if object exists: ${error.message}`);
    }
  }

  /**
   * Get object metadata
   */
  async getObjectMetadata(key: string): Promise<any> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        etag: response.ETag?.replace(/"/g, ''),
        metadata: response.Metadata,
        serverSideEncryption: response.ServerSideEncryption,
      };
    } catch (error: any) {
      logger.error('Failed to get object metadata', {
        error: error.message,
        key,
      });
      throw new Error(`Failed to get object metadata: ${error.message}`);
    }
  }
  async getSecureObjectMetadata(key: string): Promise<any> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.secureConfig.bucket,
        Key: key,
      });

      const response = await this.s3SecureClient.send(command);

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        etag: response.ETag?.replace(/"/g, ''),
        metadata: response.Metadata,
        serverSideEncryption: response.ServerSideEncryption,
      };
    } catch (error: any) {
      logger.error('Failed to get object metadata', {
        error: error.message,
        key,
      });
      throw new Error(`Failed to get object metadata: ${error.message}`);
    }
  }

  /**
   * Delete object from S3
   */
  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.secureConfig.bucket,
        Key: key,
      });

      await this.s3SecureClient.send(command);

      logger.debug('Deleted object from S3', {
        key,
      });
    } catch (error: any) {
      logger.error('Failed to delete object', {
        error: error.message,
        key,
      });
      throw new Error(`Failed to delete object: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for downloading
   */
  async generatePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
    responseContentDisposition?: string
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ContentDisposition: responseContentDisposition,
      });

      const downloadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      logger.debug('Generated presigned download URL', {
        key,
        expiresIn,
      });

      return downloadUrl;
    } catch (error: any) {
      logger.error('Failed to generate presigned download URL', {
        error: error.message,
        key,
      });
      throw new Error(
        `Failed to generate presigned download URL: ${error.message}`
      );
    }
  }
  async generateSecurePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
    responseContentDisposition?: string
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.secureConfig.bucket,
        Key: key,
        ContentDisposition: responseContentDisposition,
      });

      const downloadUrl = await getSignedUrl(this.s3SecureClient, command, {
        expiresIn,
      });

      logger.debug('Generated presigned download URL', {
        key,
        expiresIn,
      });

      return downloadUrl;
    } catch (error: any) {
      logger.error('Failed to generate presigned download URL', {
        error: error.message,
        key,
      });
      throw new Error(
        `Failed to generate presigned download URL: ${error.message}`
      );
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: string;
    bucket: string;
    region: string;
    timestamp: string;
  }> {
    try {
      // Try to list objects to verify connection
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: 'health-check-dummy-key', // This will likely return 404 but confirms connection
        })
      );
    } catch (error: any) {
      // 404 is expected for health check, other errors indicate problems
      if (error.$metadata?.httpStatusCode !== 404) {
        throw error;
      }
    }

    return {
      status: 'healthy',
      bucket: this.config.bucket,
      region: this.config.region,
      timestamp: new Date().toISOString(),
    };
  }

  //   async createMultipartUpload(p: {
  //   filename: string;
  //   contentType: string;
  //   size: number;
  //   courseId: string;
  //   userId: string;
  // }) {
  //   // choose a reasonable partSize
  //   const partSize = Math.max(MIN_PART_BYTES, Math.ceil(p.size / 100)); // ~100 parts max
  //   const key = `courses/${p.courseId}/${p.userId}/videos/${new Date()
  //     .toISOString()
  //     .slice(0, 7)}/${uuidv4()}${path.extname(p.filename)}`;

  //   const command = new CreateMultipartUploadCommand({
  //     Bucket: this.bucketName,
  //     Key: key,
  //     ContentType: p.contentType,
  //     ServerSideEncryption: 'AES256', // or KMS
  //     Metadata: { courseId: p.courseId, userId: p.userId },
  //   });

  //   const { UploadId } = await s3Client.send(command);
  //   // persist DB row (status=UPLOADING, uploadId)
  //   return { key, uploadId: UploadId!, partSize };
  // }

  // async getMultipartPartUrls(
  //   key: string,
  //   uploadId: string,
  //   partNumbers: number[]
  // ) {
  //   const urls = await Promise.all(
  //     partNumbers.map(async PartNumber => {
  //       const cmd = new UploadPartCommand({
  //         Bucket: this.bucketName,
  //         Key: key,
  //         UploadId: uploadId,
  //         PartNumber,
  //         // Optionally ContentLength if you know it per part
  //       });
  //       const url = await getSignedUrl(s3Client, cmd, { expiresIn: 60 * 10 }); // 10 min
  //       return { partNumber: PartNumber, url };
  //     })
  //   );
  //   return { urls };
  // }

  // async completeMultipartUpload(
  //   key: string,
  //   uploadId: string,
  //   parts: { PartNumber: number; ETag: string }[]
  // ) {
  //   parts.sort((a, b) => a.PartNumber - b.PartNumber);
  //   const complete = new CompleteMultipartUploadCommand({
  //     Bucket: this.bucketName,
  //     Key: key,
  //     UploadId: uploadId,
  //     MultipartUpload: { Parts: parts },
  //   });
  //   const res = await s3Client.send(complete);
  //   // update DB -> status=READY, store ETag/res.VersionId
  //   return { key, etag: res.ETag, versionId: res.VersionId };
  // }

  // async abortMultipartUpload1(key: string, uploadId: string) {
  //   await this.s3Client.send(
  //     new AbortMultipartUploadCommand({
  //       Bucket: this.config.bucket,
  //       Key: key,
  //       UploadId: uploadId,
  //     })
  //   );
  //   // update DB -> status=ABORTED
  //   return { aborted: true };
  // }
}

// Create singleton instance
const s3Config: S3Config = {
  bucket: config.s3.bucketName || process.env.S3_BUCKET_NAME!,
  region: config.s3.region,
  accessKeyId: config.s3.accessKey || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.s3.accessSecret || process.env.AWS_SECRET_ACCESS_KEY,
  maxRetries: 3,
  timeout: 60000, // 60 seconds for large file operations
};
const s3SecureConfig: S3Config = {
  bucket: config.s3.secureBucketName,
  region: config.s3.secureRegion,
  accessKeyId: config.s3.secureAccessKey,
  secretAccessKey: config.s3.secureAccessSecret,
  maxRetries: 3,
  timeout: 60000, // 60 seconds for large file operations
};

export const s3StorageService = new S3StorageService(s3Config, s3SecureConfig);
export { S3StorageService };
