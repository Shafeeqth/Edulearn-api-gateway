import { GrpcClient } from "../../../utils/grpc/client";
import { GrpcClientOptions } from "../../../utils/grpc/types";
import { BlockUserRequest, BlockUserResponse, ChangePasswordRequest, ChangePasswordResponse, CheckUserByEmailRequest, CheckUserByEmailResponse, ForgotPasswordRequest, ForgotPasswordResponse, GetAllInstructorsResponse, GetAllUserEmailsRequest, GetAllUserEmailsResponse, GetNewRefreshTokenRequest, GetNewRefreshTokenResponse, GetUserByIdRequest, GetUserByIdResponse, LoginUserRequest, LoginUserResponse, RegisterUserRequest, RegisterUserResponse, UpdateUserDetailsRequest, UpdateUserDetailsResponse, UserServiceClient, VerifyUserRequest, VerifyUserResponse } from "./proto/generated/user";

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
    const response = await this.client.unaryCall(
      "loginUser",
      request,
      options
    );
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
    const response = await this.client.unaryCall(
      "blockUser",
      request,
      options
    );
    return response as BlockUserResponse;
  }
  
  async getCurrentUser(
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
