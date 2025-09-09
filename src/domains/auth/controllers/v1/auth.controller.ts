import { AuthService } from '../../../service-clients/auth';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';
import { RegisterUserSchema } from '../../schemas/register-user.schema';
import { LoginUserSchema } from '../../schemas/login-user.schema';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';

import { NotificationService } from '../../../service-clients/notification';
import { VerifyUserSchema } from '../../schemas/verify-user.schema';
import { ResendOtpSchema } from '../../schemas/resend-otp.schema';
import { Auth2SignSchema } from '../../schemas/auth2-sign.schema';
import { LogoutUserSchema } from '../../schemas/logout.schema';
import { refreshTokenSchema } from '../../schemas/refresh-token.schema';

import { emailAvailabilitySchema } from '../../../user/schemas/email-availability.schema';
import { LoggingService } from 'services/observability/logging/logging.service';
import { TracingService } from 'services/observability/tracing/trace.service';
import { MetricsService } from 'services/observability/monitoring/monitoring.service';
import { MetadataManager } from '@/shared/utils/metadata-manager';
import { HttpStatus } from '@/shared/constants/http-status';
import { changePasswordSchema } from '../../schemas/change-password.schema';
import { BloomFilterFacade } from '@/services/bloom-filter';
import { forgotPasswordSchema } from '../../schemas/forgot-password.schema';
import { withRetry } from '@/shared/utils/retryable';
import { authRefreshToken } from '../../utils/constants';
import { attachCookies, clearCookies } from '../../utils/manage-cookies';
import { resetPasswordSchema } from '../../schemas/reset-password.schema';

export class AuthController {
  private userServiceClient: AuthService;
  private notificationService: NotificationService;
  private emailAvailabilityService?: BloomFilterFacade;
  private logger: LoggingService;
  private tracer: TracingService;
  private monitor: MetricsService;

  constructor() {
    // Observability services
    this.logger = LoggingService.getInstance();
    this.tracer = TracingService.getInstance();
    this.monitor = MetricsService.getInstance();

    // Business services
    this.userServiceClient = AuthService.getInstance();
    this.notificationService = NotificationService.getInstance();

    try {
      // Util services
      withRetry(
        async () =>
          (() => {
            this.emailAvailabilityService = BloomFilterFacade.getInstance();
          })(),
        {
          onRetry: (error, attempt, delay) => {
            console.log(
              `Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms`
            );
          },
        }
      );
    } catch (error) {}
  }

  async registerUser(req: Request, res: Response) {
    // create metadata object to pass req headers
    const metadata = new MetadataManager();

    try {
      await this.tracer.startActiveSpan(
        'AuthController.registerUser',
        async span => {
          this.logger.info(`Processing grpc method 'registerUser'`);
          span.setAttribute('grpc.method', 'getUser');

          const {
            email,
            password,
            role,
            avatar,
            firstName,
            lastName,
            authType,
          } = validateSchema(req.body, RegisterUserSchema)!;
          span.setAttribute('request.email', email);

          this.logger.debug(
            'Initiate `RegisterUser` request to `AuthService`',
            {
              ...req.body,
            }
          );
          let endRegisterUser = this.monitor.measureGRPCRequestDuration(
            'RegisterUser',
            'Api-Gateway',
            'AuthService'
          );
          const response = await this.userServiceClient.registerUser(
            {
              avatar: avatar || '',
              email,
              password,
              firstName,
              lastName,
              role,
              authType,
            },
            { metadata: metadata.metadata }
          );
          this.logger.debug(
            '`RegisterUser` request for `AuthService` has completed',
            {
              userId: response.userId || '',
            }
          );

          // Record time taken to run the request
          endRegisterUser();

          this.logger.debug(
            'Initiated `SendOtp` request for `NotificationService` ',
            {
              userId: response.userId || '',
              email,
            }
          );
          let endSendOtp = this.monitor.measureGRPCRequestDuration(
            'SendOtp',
            'Api-Gateway',
            'NotificationService'
          );

          // Business Logic
          const { success } = await this.notificationService.sendOtp(
            {
              email,
              userId: response.userId!,
              username: firstName + ' ' + lastName,
            },
            { metadata: metadata.metadata }
          );

          endSendOtp();
          this.logger.debug(
            '`SendOtp` request to `NotificationService` has completed ',
            {
              userId: response.userId || '',
              email,
            }
          );

          const resWrap = new ResponseWrapper(res);
          resWrap
            .status(HttpStatus.OK)
            .success(response, 'OTP send successfully');
        }
      );
    } catch (error: any) {
      this.logger.error(
        `Error calling  'RegisterUser' for email: ${req.body.email}: ${error.message}`
      );

      this.monitor.incrementGrpcErrorCounter(
        req.method,
        'AuthService',
        req.path,
        error?.statusCode || 500
      );
      throw error;
    }
  }

  async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword, userId } = validateSchema(
      { ...req.body, userId: req.user?.userId },
      changePasswordSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const { success } = await this.userServiceClient.changePassword(
      { oldPassword: currentPassword, newPassword, userId },
      {
        metadata: metadata.metadata,
      }
    );

    const resWrap = new ResponseWrapper(res);

    return resWrap
      .status(HttpStatus.OK)
      .success({ updated: true }, 'Password has been updated successfully');
  }

  async resetPassword(req: Request, res: Response) {
    const schemaResponse = validateSchema(
      { ...req.body, ...req.params },
      resetPasswordSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const { success } = await this.userServiceClient.resetPassword(
      schemaResponse,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success({ updated: true }, 'Password has been updated successfully');
  }

  async forgotPassword(req: Request, res: Response) {
    const schemaResponse = validateSchema(req.body, forgotPasswordSchema)!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const { success } = await this.userServiceClient.forgotPassword(
      schemaResponse,
      {
        metadata: metadata.metadata,
      }
    );

    const response = await this.notificationService.forgotPassword(success!);

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        { updated: true },
        'Password reset link has been sent to your email, please check your email address'
      );
  }

  async oauthSign(req: Request, res: Response) {
    const { provider, token, authType } = validateSchema(
      req.body,
      Auth2SignSchema
    )!;

    const { success: serverResponse } = await this.userServiceClient.auth2Sign({
      provider,
      token,
      authType,
    });

    const resWrap = new ResponseWrapper(res);
    // Attach token to to response cookies
    attachCookies(
      resWrap,
      serverResponse!.refreshToken,
      serverResponse!.accessToken
    );

    return resWrap
      .status(HttpStatus.OK)
      .success(
        { token: serverResponse!.accessToken },
        'oauth request been completed successfully'
      );
  }

  async checkEmailAvailability(req: Request, res: Response) {
    const { email } = validateSchema(req.body, emailAvailabilitySchema)!;

    const isEmailAvailable =
      await this.emailAvailabilityService!.isEmailAvailable(email);
    new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        { available: !!isEmailAvailable },
        isEmailAvailable ? 'Email available' : 'Email already taken'
      );
  }

  async resendOtp(req: Request, res: Response) {
    const { email, userId, username } = validateSchema(
      req.body,
      ResendOtpSchema
    )!;

    const { success } = await this.notificationService.sendOtp({
      email,
      userId: userId || '',
      username: username || 'User',
    });

    const resWrap = new ResponseWrapper(res);

    resWrap.status(HttpStatus.OK).success({}, success?.message);
  }

  async verifyUser(req: Request, res: Response) {
    const { email, code } = validateSchema(req.body, VerifyUserSchema)!;

    const { success } = await this.notificationService.verifyOtp({
      email,
      otp: code,
    });
    const resWrap = new ResponseWrapper(res);

    // Next round trip to user service to mark user as verified
    // And fetch user credentials
    // NB: Here you can use Async messaging instead of Sync but
    // for me I chose sync, so no need to make another login request after register
    // reduce user effort, round trip and fetch the user credentials
    const { success: successResponse } =
      await this.userServiceClient.verifyUser({
        email,
      })!;

    // Update email into bloom filter
    this.emailAvailabilityService!.addEmail(email);

    attachCookies(
      resWrap,
      successResponse!.refreshToken,
      successResponse!.accessToken
    );

    return resWrap
      .status(HttpStatus.OK)
      .success({ token: successResponse!.accessToken }, 'Login successful');
  }

  /**
   * Login user with credentials
   * @param req
   * @param res
   * @returns
   */

  async loginUser(req: Request, res: Response) {
    const { email, password, rememberMe } = validateSchema(
      req.body,
      LoginUserSchema
    )!;

    const { success } = await this.userServiceClient.loginUser({
      email,
      password,
      rememberMe,
    });
    const resWrap = new ResponseWrapper(res);
    attachCookies(resWrap, success!.refreshToken, success!.accessToken);

    return resWrap
      .status(HttpStatus.OK)
      .success({ token: success!.accessToken }, 'Login successful');
  }

  async logoutUser(req: Request, res: Response) {
    const { userId } = validateSchema(req.body, LogoutUserSchema)!;

    const serverResponse = await this.userServiceClient.logoutUser({
      userId,
    });

    const resWrap = new ResponseWrapper(res);
    clearCookies(resWrap);

    return resWrap
      .status(HttpStatus.OK)
      .success(serverResponse, 'user logged out successfully');
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = validateSchema(
      { refreshToken: req.cookies[authRefreshToken] },
      refreshTokenSchema
    )!;

    const { error, success } = await this.userServiceClient.refreshToken({
      refreshToken,
    });
    const resWrap = new ResponseWrapper(res);

    return resWrap
      .status(HttpStatus.OK)
      .success({ token: success!.accessToken }, 'refresh successful');
  }
}
