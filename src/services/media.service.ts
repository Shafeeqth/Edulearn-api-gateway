import cloudinary from '../config/cloudinary.config';
import { IMediaService } from './interfaces/media.interface';
import { Readable } from 'stream';
import { LoggingService } from './observability/logging/logging.service';
import { promisify } from 'util';
import { config } from '@/config';

const logger = LoggingService.getInstance();

interface UploadOptions {
  folder?: string;
  format?: string;
  quality?: number;
  transformation?: any[];
}

export class CloudinaryMediaService implements IMediaService {
  private readonly defaultImageOptions: UploadOptions = {
    folder: 'edulearn/images',
    format: 'auto',
    quality: 80,
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' },
      { quality: 'auto:good' },
    ],
  };

  private readonly defaultFileOptions: UploadOptions = {
    folder: 'edulearn/files',
    quality: 90,
  };

  async uploadImage(
    file: Express.Multer.File,
    options: Partial<UploadOptions> = {}
  ): Promise<{ url: string; publicId: string; size: number }> {
    const uploadOptions = { ...this.defaultImageOptions, ...options };

    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const uploadConfig: any = {
        resource_type: 'image',
        ...uploadOptions,
        eager: [
          { width: 800, height: 600, crop: 'fill', quality: 'auto' },
          { width: 400, height: 300, crop: 'fill', quality: 'auto' },
        ],
        eager_async: true,
      };

      // Only add webhook URL if it's configured
      if (process.env.CLOUDINARY_WEBHOOK_URL) {
        uploadConfig.eager_notification_url =
          process.env.CLOUDINARY_WEBHOOK_URL;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadConfig,
        (error, result) => {
          const duration = Date.now() - startTime;

          if (error) {
            logger.error('Image upload failed', {
              error: error.message,
              duration,
              fileSize: file.size,
              fileName: file.originalname,
            });
            return reject(new Error(`Image upload failed: ${error.message}`));
          }

          if (!result) {
            logger.error('Image upload returned no result', {
              duration,
              fileSize: file.size,
            });
            return reject(new Error('Image upload failed: No result returned'));
          }

          logger.info('Image uploaded successfully', {
            publicId: result.public_id,
            url: result.secure_url,
            duration,
            fileSize: file.size,
            transformedSize: result.bytes,
          });

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes || file.size,
          });
        }
      );

      // Create readable stream with error handling
      const readableStream = new Readable({
        read() {
          this.push(file.buffer);
          this.push(null);
        },
      });

      readableStream.on('error', error => {
        logger.error('Stream error during image upload', {
          error: error.message,
        });
        reject(error);
      });

      readableStream.pipe(uploadStream);
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    options: Partial<UploadOptions> = {}
  ): Promise<{ url: string; publicId: string; size: number }> {
    const uploadOptions = { ...this.defaultFileOptions, ...options };

    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          ...uploadOptions,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          const duration = Date.now() - startTime;

          if (error) {
            logger.error('File upload failed', {
              error: error.message,
              duration,
              fileSize: file.size,
              fileName: file.originalname,
            });
            return reject(new Error(`File upload failed: ${error.message}`));
          }

          if (!result) {
            logger.error('File upload returned no result', {
              duration,
              fileSize: file.size,
            });
            return reject(new Error('File upload failed: No result returned'));
          }

          logger.info('File uploaded successfully', {
            publicId: result.public_id,
            url: result.secure_url,
            duration,
            fileSize: file.size,
            resourceType: result.resource_type,
          });

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes || file.size,
          });
        }
      );

      const readableStream = new Readable({
        read() {
          this.push(file.buffer);
          this.push(null);
        },
      });

      readableStream.on('error', error => {
        logger.error('Stream error during file upload', {
          error: error.message,
        });
        reject(error);
      });

      readableStream.pipe(uploadStream);
    });
  }

  async deleteMedia(publicId: string): Promise<void> {
    try {
      const startTime = Date.now();
      const result = await cloudinary.uploader.destroy(publicId);
      const duration = Date.now() - startTime;

      if (result.result === 'ok') {
        logger.info('Media deleted successfully', { publicId, duration });
      } else {
        logger.warn('Media deletion returned unexpected result', {
          publicId,
          result: result.result,
          duration,
        });
      }
    } catch (error) {
      logger.error('Media deletion failed', {
        publicId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(
        `Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async optimizedImageUpload(
    file: Express.Multer.File,
    optimizationOptions: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: string;
    } = {}
  ): Promise<Express.Multer.File> {
    // TODO: Implement image optimization using sharp or similar library
    // This would resize, compress, and optimize images before upload
    logger.info('Image optimization not yet implemented', {
      fileName: file.originalname,
      fileSize: file.size,
    });
    return file;
  }

  async getMediaInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      logger.error('Failed to get media info', {
        publicId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(
        `Failed to get media info: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async generateSignedUrl(
    publicId: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const url = cloudinary.url(publicId, {
        sign_url: true,
        type: 'upload',
        secure: true,
        expires_at: Math.floor(Date.now() / 1000) + expiresIn,
      });
      return url;
    } catch (error) {
      logger.error('Failed to generate signed URL', {
        publicId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(
        `Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  getSignedUploadUrl(uploadType: string, userId: string) {
    // Validate upload type
    const allowedTypes = ['avatar', 'document', 'assignment'];
    if (!allowedTypes.includes(uploadType)) {
      throw new Error('Invalid upload type');
    }

    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `users/${userId}/${uploadType}/${timestamp}`;

    // Define upload parameters based on type
    const uploadParams = {
      timestamp,
      public_id: publicId,
      folder: `edulearn`,
      ...(uploadType === 'avatar' && {
        transformation: 'c_fill,w_400,h_400,q_auto,f_auto',
        allowed_formats: 'jpg,png,webp',
      }),
      ...(uploadType === 'document' && {
        resource_type: 'auto',
        allowed_formats: 'pdf,doc,docx,jpg,png',
      }),
    };
    try {
      // Generate signature
      const signature = cloudinary.utils.api_sign_request(
        uploadParams,
        config.cloudinary.apiSecret!
      );

      // Log upload request for monitoring
      logger.info(
        `Upload signature generated for user ${userId}, type: ${uploadType}`
      );

      return {
        signature,
        timestamp,
        publicId,
        apiKey: config.cloudinary.apiKey,
        cloudName: config.cloudinary.cloudName,
        uploadParams: {
          folder: uploadParams.folder,
          ...(uploadParams.transformation && {
            transformation: uploadParams.transformation,
          }),
          ...(uploadParams.allowed_formats && {
            allowed_formats: uploadParams.allowed_formats,
          }),
          ...(uploadParams.resource_type && {
            resource_type: uploadParams.resource_type,
          }),
        },
      };
    } catch (error: any) {
      logger.error('Upload signature generation error:', { error });
      throw error;
    }
  }
}
