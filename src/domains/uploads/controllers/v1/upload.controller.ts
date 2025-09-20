import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '../../../service-clients/notification';
import { LoggingService } from 'services/observability/logging/logging.service';
import { TracingService } from 'services/observability/tracing/trace.service';
import { MetricsService } from 'services/observability/monitoring/monitoring.service';
import { MetadataManager } from '@/shared/utils/metadata-manager';
import { HttpStatus } from '@/shared/constants/http-status';
import { CloudinaryMediaService } from '@/services/media.service';
import { avatarPresignedSchema } from '../../schemas/avatar.presigned.schema';
import { s3StorageService, S3StorageService } from '@/services/storage.service';
import { courseUploadPreSignSchema } from '../../schemas/course-presign.schema';
import { getCoursePreSignSchema } from '../../schemas/get-course-presign.schema';

export class UploaderService {
  private mediaService: CloudinaryMediaService;
  private storageService: S3StorageService;
  private logger: LoggingService;
  private tracer: TracingService;
  private monitor: MetricsService;

  constructor() {
    // Observability services
    this.logger = LoggingService.getInstance();
    this.tracer = TracingService.getInstance();
    this.monitor = MetricsService.getInstance();

    // Business services
    this.mediaService = new CloudinaryMediaService();
    this.storageService = s3StorageService;
  }

  async getPreSignedAvatarUploadUrl(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UploaderService.getPreSignedAvatarUploadUrl',
        async span => {
          this.logger.info(`Processing  method 'getPreSignedAvatarUploadUrl'`);

          const { uploadType, userId } = validateSchema(
            { ...req.body, userId: req.user?.userId },
            avatarPresignedSchema
          )!;
          span.setAttribute('request.userId', userId);

          const response = this.mediaService.getSignedUploadUrl(
            uploadType,
            userId
          );

          this.logger.info('getSignedUploadUrl execution has completed ');

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(response, 'generated signed upload url successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'getSignedUploadUrl' for user: ${req.user?.userId}: ${error.message}`
      );

      throw error;
    }
  }
  async getPreSignedCourseUploadUrl(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UploaderService.getPreSignedCourseUploadUrl',
        async span => {
          this.logger.info(`Processing  method 'getPreSignedCourseUploadUrl'`);

          const validPayload = validateSchema(
            { ...req.body, userId: req.user?.userId },
            courseUploadPreSignSchema
          )!;
          // span.setAttribute('request.userId', userId);

          const response =
            await this.storageService.generatePresignedUploadUrl(validPayload);

          this.logger.info(
            'getPreSignedCourseUploadUrl execution has completed '
          );

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(response, 'generated signed upload url successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'getSignedUploadUrl' for user: ${req.user?.userId}: ${error.message}`
      );

      throw error;
    }
  }
  async getPreSignedCourseSecureUploadUrl(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UploaderService.getPreSignedCourseUploadUrl',
        async span => {
          this.logger.info(`Processing  method 'getPreSignedCourseUploadUrl'`);

          const validPayload = validateSchema(
            { ...req.body, userId: req.user?.userId },
            courseUploadPreSignSchema
          )!;
          // span.setAttribute('request.userId', userId);

          const response =
            await this.storageService.generateSecurePresignedUploadUrl(
              validPayload
            );

          this.logger.info(
            'getPreSignedCourseUploadUrl execution has completed '
          );

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(response, 'generated signed upload url successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'getSignedUploadUrl' for user: ${req.user?.userId}: ${error.message}`
      );

      throw error;
    }
  }

  async getSecureSignedCourseUrl(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UploaderService.getSignedCourseUrl',
        async span => {
          this.logger.info(`Processing  method 'getSignedCourseUrl'`);

          const { key } = validateSchema(
            { ...req.body, userId: req.user?.userId },
            getCoursePreSignSchema
          )!;
          // span.setAttribute('request.userId', userId);

          const response =
            await this.storageService.getSignedSecureCourseUrl(key);

          this.logger.info('getSignedCourseUrl execution has completed ');

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(response, 'generated signed upload url successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'getSignedCourseUrl' for user: ${req.user?.userId}: ${error.message}`
      );

      throw error;
    }
  }
  async multipartSignInit(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UploaderService.getSignedUploadUrl',
        async span => {
          this.logger.info(`Processing  method 'getSignedUploadUrl'`);

          const { uploadType, userId } = validateSchema(
            { ...req.body, userId: req.user?.userId },
            avatarPresignedSchema
          )!;
          span.setAttribute('request.userId', userId);

          /**
           * return this.storage.createMultipartUpload({
    filename: dto.filename,
    contentType: dto.contentType,
    size: dto.size,
    courseId: dto.courseId,
    userId: req.user.id,
  });
           */

          const response = this.mediaService.getSignedUploadUrl(
            uploadType,
            userId
          );

          this.logger.info('getSignedUploadUrl execution has completed ');

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(response, 'generated signed upload url successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'getSignedUploadUrl' for user: ${req.user?.userId}: ${error.message}`
      );

      throw error;
    }
  }
  async multipartSignComplete(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UploaderService.getSignedUploadUrl',
        async span => {
          this.logger.info(`Processing  method 'getSignedUploadUrl'`);

          const { uploadType, userId } = validateSchema(
            { ...req.body, userId: req.user?.userId },
            avatarPresignedSchema
          )!;
          span.setAttribute('request.userId', userId);

          /**
           return this.storage.completeMultipartUpload(dto.key, dto.uploadId, dto.parts);
           */

          const response = this.mediaService.getSignedUploadUrl(
            uploadType,
            userId
          );

          this.logger.info('getSignedUploadUrl execution has completed ');

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(response, 'generated signed upload url successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'getSignedUploadUrl' for user: ${req.user?.userId}: ${error.message}`
      );

      throw error;
    }
  }
  async multipartSignGetParts(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UploaderService.getSignedUploadUrl',
        async span => {
          this.logger.info(`Processing  method 'getSignedUploadUrl'`);

          const { uploadType, userId } = validateSchema(
            { ...req.body, userId: req.user?.userId },
            avatarPresignedSchema
          )!;
          span.setAttribute('request.userId', userId);

          /**
            return this.storage.getMultipartPartUrls(dto.key, dto.uploadId, dto.partNumbers);
           */

          const response = this.mediaService.getSignedUploadUrl(
            uploadType,
            userId
          );

          this.logger.info('getSignedUploadUrl execution has completed ');

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(response, 'generated signed upload url successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'getSignedUploadUrl' for user: ${req.user?.userId}: ${error.message}`
      );

      throw error;
    }
  }
  async multipartSignAbort(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UploaderService.getSignedUploadUrl',
        async span => {
          this.logger.info(`Processing  method 'getSignedUploadUrl'`);

          const { uploadType, userId } = validateSchema(
            { ...req.body, userId: req.user?.userId },
            avatarPresignedSchema
          )!;
          span.setAttribute('request.userId', userId);

          /**
             return this.storage.abortMultipartUpload(body.key, body.uploadId);
           */

          const response = this.mediaService.getSignedUploadUrl(
            uploadType,
            userId
          );

          this.logger.info('getSignedUploadUrl execution has completed ');

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(response, 'generated signed upload url successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'getSignedUploadUrl' for user: ${req.user?.userId}: ${error.message}`
      );

      throw error;
    }
  }
}
