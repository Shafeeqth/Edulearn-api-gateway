import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import {
  Auth2SignRequest,
  Auth2SignResponse,
  AuthServiceClient,
  BlockUserRequest,
  BlockUserResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CheckUserByEmailRequest,
  CheckUserByEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LoginUserRequest,
  LoginUserResponse,
  LogoutUserRequest,
  LogoutUserResponse,
  RegisterInstructorRequest,
  RegisterInstructorResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UnBlockUserRequest,
  UnBlockUserResponse,
  VerifyUserRequest,
  VerifyUserResponse,
} from './proto/generated/auth_service';
import { config } from 'config';

export class AuthService {
  private readonly client: GrpcClient<AuthServiceClient>;
  private static instance: AuthService;

  private constructor() {
    const [host = 'localhost', port = '50051'] =
      config.grpc.services.authService.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(__dirname, 'proto', 'auth_service.proto'),
      packageName: 'auth_service',
      serviceName: 'AuthService',
      host,
      port: parseInt(port),
    });
  }

  // Singleton pattern
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async registerUser(
    request: RegisterUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<RegisterUserResponse> {
    const response = await this.client.unaryCall(
      'registerUser',
      request,
      options
    );
    return response as RegisterUserResponse;
  }

  async auth2Sign(
    request: Auth2SignRequest,
    options: GrpcClientOptions = {}
  ): Promise<Auth2SignResponse> {
    const response = await this.client.unaryCall('auth2Sign', request, options);
    return response as Auth2SignResponse;
  }

  async logoutUser(
    request: LogoutUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<LogoutUserResponse> {
    const response = await this.client.unaryCall(
      'logoutUser',
      request,
      options
    );
    return response as LogoutUserResponse;
  }

  async verifyUser(
    request: VerifyUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<VerifyUserResponse> {
    const response = await this.client.unaryCall(
      'verifyUser',
      request,
      options
    );
    return response as VerifyUserResponse;
  }

  async refreshToken(
    request: RefreshTokenRequest,
    options: GrpcClientOptions = {}
  ): Promise<RefreshTokenResponse> {
    const response = await this.client.unaryCall(
      'refreshToken',
      request,
      options
    );
    return response as RefreshTokenResponse;
  }

  async loginUser(
    request: LoginUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<LoginUserResponse> {
    const response = await this.client.unaryCall('loginUser', request, options);
    return response as LoginUserResponse;
  }

  async forgotPassword(
    request: ForgotPasswordRequest,
    options: GrpcClientOptions = {}
  ): Promise<ForgotPasswordResponse> {
    const response = await this.client.unaryCall(
      'forgotPassword',
      request,
      options
    );
    return response as ForgotPasswordResponse;
  }

  async changePassword(
    request: ChangePasswordRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChangePasswordResponse> {
    const response = await this.client.unaryCall(
      'changePassword',
      request,
      options
    );
    return response as ChangePasswordResponse;
  }

  async resetPassword(
    request: ResetPasswordRequest,
    options: GrpcClientOptions = {}
  ): Promise<ResetPasswordResponse> {
    const response = await this.client.unaryCall(
      'resetPassword',
      request,
      options
    );
    return response as ResetPasswordResponse;
  }

  async blockUser(
    request: BlockUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<BlockUserResponse> {
    const response = await this.client.unaryCall('blockUser', request, options);
    return response as BlockUserResponse;
  }
  async unBlockUser(
    request: UnBlockUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<UnBlockUserResponse> {
    const response = await this.client.unaryCall(
      'unBlockUser',
      request,
      options
    );
    return response as UnBlockUserResponse;
  }

  close() {
    this.client.close();
  }
}
