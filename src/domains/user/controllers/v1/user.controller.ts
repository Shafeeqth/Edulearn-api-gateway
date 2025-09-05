import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';

import { NotificationService } from '../../../service-clients/notification';

import { blockUserSchema } from '../../schemas/block-user.schema';
import {
  AsObject,
  protoTimestampToDate,
} from '@/shared/utils/time-converters/proto-timestamp-converters';
import { updateUserSchema } from '../../schemas/update-user.schema';
import { unBlockUserSchema } from '../../schemas/unblock-user.schema';
import { detailedUserSchema } from '../../schemas/get-user.schema';
import { MetadataManager } from '@/shared/utils/metadata-manager';
import { LoggingService } from 'services/observability/logging/logging.service';
import { TracingService } from 'services/observability/tracing/trace.service';
import { MetricsService } from 'services/observability/monitoring/monitoring.service';
import { HttpStatus } from '@/shared/constants/http-status';
import { UserInfo } from '@/domains/service-clients/user/proto/generated/user_service';
import { ResponseMapper } from '@/shared/utils/response-mapper';
import { updateCurrentUserSchema } from '../../schemas/update-current-user.schema';
import { currentUserSchema } from '../../schemas/current-user.schema';
import { registerInstructorSchema } from '../../schemas/register-instructor.schema';

export class UserController {
  private userServiceClient: UserService;
  private notificationService: NotificationService;

  private logger: LoggingService;
  private tracer: TracingService;
  private monitor: MetricsService;

  constructor() {
    // Observability services
    this.logger = LoggingService.getInstance();
    this.tracer = TracingService.getInstance();
    this.monitor = MetricsService.getInstance();

    // Business services
    this.userServiceClient = UserService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  async blockUser(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UserController.blockUser',
        async span => {
          this.logger.info(`Processing grpc method 'blockUser'`);
          span.setAttribute('grpc.method', 'getUser');
          const { userId } = validateSchema(req.body, blockUserSchema)!;

          // create metadata object to pass req headers
          const metadata = new MetadataManager();
          metadata.set({
            'x-user': req.user,
            correlationId: req.correlationId,
          }); // send user data in `x-user` header

          const serverResponse = await this.userServiceClient.blockUser(
            { userId },
            {
              metadata: metadata.metadata,
            }
          );

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success({ updated: true }, 'Use has been blocked successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'blockUser' for email: ${req.user?.email}: ${error.message}`,
        { error }
      );

      this.monitor.incrementGrpcErrorCounter(
        req.method,
        'UserService',
        req.path,
        error?.statusCode || 500
      );
      throw error;
    }
  }
  async unBlockUser(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UserController.unBlockUser',
        async span => {
          this.logger.info(`Processing grpc method 'unBlockUser'`);
          span.setAttribute('grpc.method', 'getUser');
          const { userId } = validateSchema(req.body, unBlockUserSchema)!;

          // create metadata object to pass req headers
          const metadata = new MetadataManager();
          metadata.set({
            'x-user': req.user,
            correlationId: req.correlationId,
          }); // send user data in `x-user` header

          const { success } = await this.userServiceClient.unBlockUser(
            { userId },
            {
              metadata: metadata.metadata,
            }
          );

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success({ updated: true }, 'Use has been UnBlocked successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'unBlockUser' for email: ${req.user?.email}: ${error.message}`,
        { error }
      );

      this.monitor.incrementGrpcErrorCounter(
        req.method,
        'UserService',
        req.path,
        error?.statusCode || 500
      );
      throw error;
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UserController.getUser',
        async span => {
          this.logger.info(`Processing grpc method 'getUser'`);
          span.setAttribute('grpc.method', 'getUser');
          const { userId } = validateSchema(req.params, detailedUserSchema)!;

          // create metadata object to pass req headers
          const metadata = new MetadataManager();
          metadata.set({
            'x-user': req.user,
            correlationId: req.correlationId,
          }); // send user data in `x-user` header

          const { user } = await this.userServiceClient.getUser(
            { userId },
            { metadata: metadata.metadata }
          );

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(
              this.mapToUserResponse(user!),
              'Fetched user data successfully'
            );
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'getUser' for email: ${req.user?.email}: ${error.message}`,
        { error }
      );

      this.monitor.incrementGrpcErrorCounter(
        req.method,
        'UserService',
        req.path,
        error?.statusCode || 500
      );
      throw error;
    }
  }
  async getCurrentUser(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UserController.getCurrentUser',
        async span => {
          this.logger.info(`Processing grpc method 'getCurrentUser'`);
          span.setAttribute('grpc.method', 'getCurrentUser');
          const { userId } = validateSchema(req.user, currentUserSchema)!;

          // create metadata object to pass req headers
          const metadata = new MetadataManager();
          metadata.set({
            authorization: req.authToken,
            correlationId: req.correlationId,
          }); // send user data in `x-user` header

          const { user } = await this.userServiceClient.getCurrentUser(
            { userId: req.user!.userId },
            { metadata: metadata.metadata }
          );

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(
              this.mapToUserResponse(user!),
              'Fetched current user data successfully'
            );
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'getCurrentUser' for email: ${req.user?.email}: ${error.message}`,
        { error }
      );

      this.monitor.incrementGrpcErrorCounter(
        req.method,
        'UserService',
        req.path,
        error?.statusCode || 500
      );
      throw error;
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UserController.registerUser',
        async span => {
          this.logger.info(`Processing grpc method 'registerUser'`);
          span.setAttribute('grpc.method', 'getUser');
          // Retrieve refresh token from the cookies

          const page = parseInt(req.params.page || '0');
          const pageSize = parseInt(req.params.pageSize || '0');

          // create metadata object to pass req headers
          const metadata = new MetadataManager();
          metadata.set({
            'x-user': req.user,
            correlationId: req.correlationId,
          }); // send user data in `x-user` header

          const { success } = await this.userServiceClient.getAllUsers(
            { pagination: { page, pageSize } },
            { metadata: metadata.metadata }
          );

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(
              success?.users.map(this.mapToUserResponse),
              'User response fetched successfully'
            );
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'RegisterUser' for email: ${req.user?.email}: ${error.message}`,
        { error }
      );

      this.monitor.incrementGrpcErrorCounter(
        req.method,
        'UserService',
        req.path,
        error?.statusCode || 500
      );
      throw error;
    }
  }

  async updateUserData(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UserController.updateUserData',
        async span => {
          this.logger.info(`Processing grpc method 'updateUserData'`);
          span.setAttribute('grpc.method', 'getUser');
          const validatedUserData = validateSchema(
            { ...req.body, ...req.params },
            updateUserSchema
          )!;

          // create metadata object to pass req headers
          const metadata = new MetadataManager();
          metadata.set({
            'x-user': req.user,
            correlationId: req.correlationId,
          }); // send user data in `x-user` header

          const { user: updatedUser } =
            await this.userServiceClient.updateUserDetails(validatedUserData, {
              metadata: metadata.metadata,
            });

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(
              this.mapToUserResponse(updatedUser!),
              'User data updated successfully'
            );
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'updateUserData' for email: ${req.user?.email}: ${error.message}`,
        { error }
      );

      this.monitor.incrementGrpcErrorCounter(
        req.method,
        'UserService',
        req.path,
        error?.statusCode || 500
      );
      throw error;
    }
  }
  async registerInstructor(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UserController.registerInstructor',
        async span => {
          this.logger.info(`Processing grpc method 'registerInstructor'`);
          span.setAttribute('grpc.method', 'getUser');
          const validatedUserData = validateSchema(
            { ...req.body, userId: req.user?.userId },
            registerInstructorSchema
          )!;

          // create metadata object to pass req headers
          const metadata = new MetadataManager();
          metadata.set({
            'x-user': req.user,
            correlationId: req.correlationId,
          }); // send user data in `x-user` header

          const { success } = await this.userServiceClient.registerInstructor(
            validatedUserData,
            {
              metadata: metadata.metadata,
            }
          );

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(
              this.mapToUserResponse(success?.user!),
              'User data updated successfully'
            );
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'registerInstructor' for email: ${req.user?.email}: ${error.message}`,
        { error }
      );

      this.monitor.incrementGrpcErrorCounter(
        req.method,
        'UserService',
        req.path,
        error?.statusCode || 500
      );
      throw error;
    }
  }

  async updateCurrentUser(req: Request, res: Response) {
    try {
      await this.tracer.startActiveSpan(
        'UserController.updateCurrentUser',
        async span => {
          this.logger.info(`Processing grpc method 'updateCurrentUser'`);
          span.setAttribute('grpc.method', 'updateCurrentUser');
          const validatedUserData = validateSchema(
            { ...req.body, userId: req.user?.userId },
            updateCurrentUserSchema
          )!;

          // create metadata object to pass req headers
          const metadata = new MetadataManager();
          metadata.set({
            'x-user': req.user,
            correlationId: req.correlationId,
          }); // send user data in `x-user` header

          const { user: updatedUser } =
            await this.userServiceClient.updateUserDetails(validatedUserData, {
              metadata: metadata.metadata,
            });

          return new ResponseWrapper(res)
            .status(HttpStatus.OK)
            .success(
              this.mapToUserResponse(updatedUser!),
              'User data updated successfully'
            );
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'updateCurrentUser' for email: ${req.user?.email}: ${error.message}`,
        { error }
      );

      this.monitor.incrementGrpcErrorCounter(
        req.method,
        'UserService',
        req.path,
        error?.statusCode || 500
      );
      throw error;
    }
  }

  async get(req: Request, res: Response) {
    // Retrieve refresh token from the cookies

    const page = parseInt(req.params.page || '0');
    const pageSize = parseInt(req.params.pageSize || '0');

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const { success } = await this.userServiceClient.getAllUsers(
      { pagination: { page, pageSize } },
      { metadata: metadata.metadata }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(success, 'User response fetched successfully');
  }

  private mapToUserResponse(user: UserInfo): UserInfo {
    return new ResponseMapper<typeof user, UserInfo>({
      fields: {
        email: 'email',
        avatar: 'avatar',
        biography: 'biography',
        firstName: 'firstName',
        lastName: 'lastName',
        role: 'role',
        createdAt: 'createdAt',
        facebook: 'facebook',
        headline: 'headline',
        instagram: 'instagram',
        language: 'language',
        linkedin: 'linkedin',
        phone: 'phone',
        status: 'status',
        updatedAt: 'updatedAt',
        userId: 'userId',
        website: 'website',
      },
    }).toResponse(user);
  }
}
