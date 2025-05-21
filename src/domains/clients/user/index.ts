import { GrpcClient } from "../../../utils/grpc/client";
import { GrpcClientOptions } from "../../../utils/grpc/types";
import {
  Auth2SignRequest,
  Auth2SignResponse,
  BlockUserRequest,
  BlockUserResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CheckUserByEmailRequest,
  CheckUserByEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GetAllInstructorsResponse,
  GetAllUserEmailsRequest,
  GetAllUserEmailsResponse,
  GetAllUsersRequest,
  GetAllUsersResponse,
  GetCurrentUserRequest,
  GetCurrentUserResponse,
  GetDetailedUserRequest,
  GetDetailedUserResponse,
  GetNewRefreshTokenRequest,
  GetNewRefreshTokenResponse,
  GetUserByIdRequest,
  GetUserByIdResponse,
  LoginUserRequest,
  LoginUserResponse,
  LogoutUserRequest,
  LogoutUserResponse,
  RegisterInstructorRequest,
  RegisterInstructorResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  UnBlockUserRequest,
  UnBlockUserResponse,
  UpdateUserDetailsRequest,
  UpdateUserDetailsResponse,
  UserServiceClient,
  VerifyUserRequest,
  VerifyUserResponse,
} from "./proto/generated/user";

export class UserService {
  private readonly client: GrpcClient<Partial<UserServiceClient>>;

  constructor(host: string, port: number) {
    this.client = new GrpcClient({
      protoPath: process.cwd() + "/src/domains/clients/user/proto/user.proto",
      packageName: "user",
      serviceName: "UserService",
      host,
      port,
    });
  }

  async registerUser(
    request: RegisterUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<RegisterUserResponse> {
    const response = await this.client.unaryCall(
      "registerUser",
      request,
      options
    );
    return response as RegisterUserResponse;
  }

  async auth2Sign(
    request: Auth2SignRequest,
    options: GrpcClientOptions = {}
  ): Promise<Auth2SignResponse> {
    const response = await this.client.unaryCall("auth2Sign", request, options);
    return response as Auth2SignResponse;
  }
  async registerInstructor(
    request: RegisterInstructorRequest,
    options: GrpcClientOptions = {}
  ): Promise<RegisterInstructorResponse> {
    const response = await this.client.unaryCall("registerInstructor", request, options);
    return response as RegisterInstructorResponse;
  }

  async logoutUser(
    request: LogoutUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<LogoutUserResponse> {
    const response = await this.client.unaryCall(
      "logoutUser",
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
      "verifyUser",
      request,
      options
    );
    return response as VerifyUserResponse;
  }

  async checkUserEmailExists(
    request: CheckUserByEmailRequest,
    options: GrpcClientOptions = {}
  ): Promise<CheckUserByEmailResponse> {
    const response = await this.client.unaryCall(
      "checkUserEmailExist",
      request,
      options
    );
    return response as CheckUserByEmailResponse;
  }

  async getAllUserEmails(
    request: GetAllUserEmailsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetAllUserEmailsResponse> {
    const response = await this.client.unaryCall(
      "getAllUserEmails",
      request,
      options
    );
    return response as GetAllUserEmailsResponse;
  }

  async getNewRefreshToken(
    request: GetNewRefreshTokenRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetNewRefreshTokenResponse> {
    const response = await this.client.unaryCall(
      "getNewRefreshToken",
      request,
      options
    );
    return response as GetNewRefreshTokenResponse;
  }

  async loginUser(
    request: LoginUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<LoginUserResponse> {
    const response = await this.client.unaryCall("loginUser", request, options);
    return response as LoginUserResponse;
  }

  async forgotPassword(
    request: ForgotPasswordRequest,
    options: GrpcClientOptions = {}
  ): Promise<ForgotPasswordResponse> {
    const response = await this.client.unaryCall(
      "forgotPassword",
      request,
      options
    );
    return response as ForgotPasswordResponse;
  }
  async getDetailedUser(
    request: GetDetailedUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetDetailedUserResponse> {
    const response = await this.client.unaryCall(
      "getDetailedUser",
      request,
      options
    );
    return response as GetDetailedUserResponse;
  }

  async updateUserDetails(
    request: UpdateUserDetailsRequest,
    options: GrpcClientOptions = {}
  ): Promise<LoginUserResponse> {
    const response = await this.client.unaryCall(
      "updateUserDetails",
      request,
      options
    );
    return response as UpdateUserDetailsResponse;
  }

  async changePassword(
    request: ChangePasswordRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChangePasswordResponse> {
    const response = await this.client.unaryCall(
      "changePassword",
      request,
      options
    );
    return response as ChangePasswordResponse;
  }

  async blockUser(
    request: BlockUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<BlockUserResponse> {
    const response = await this.client.unaryCall("blockUser", request, options);
    return response as BlockUserResponse;
  }
  async unBlockUser(
    request: UnBlockUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<UnBlockUserResponse> {
    const response = await this.client.unaryCall(
      "unBlockUser",
      request,
      options
    );
    return response as UnBlockUserResponse;
  }

  async getCurrentUser(
    request: GetCurrentUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetCurrentUserResponse> {
    const response = await this.client.unaryCall(
      "getCurrentUser",
      request,
      options
    );
    return response as GetCurrentUserResponse;
  }

  async getAllUsers(
    request: GetAllUsersRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetAllUsersResponse> {
    const response = await this.client.unaryCall(
      "getAllUsers",
      request,
      options
    );
    return response as GetAllUsersResponse;
  }

  async getUser(
    request: GetUserByIdRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetUserByIdResponse> {
    const response = await this.client.unaryCall(
      "getUserById",
      request,
      options
    );
    return response as GetUserByIdResponse;
  }

  close() {
    this.client.close();
  }
}
