import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import {
  AddToCartRequest,
  AddToCartResponse,
  AddToWishlistRequest,
  AddToWishlistResponse,
  BlockUserRequest,
  BlockUserResponse,
  CheckUserByEmailRequest,
  CheckUserByEmailResponse,
  GetAllUserEmailsRequest,
  GetAllUserEmailsResponse,
  GetAllUsersRequest,
  GetAllUsersResponse,
  GetCurrentUserRequest,
  GetCurrentUserResponse,
  GetUserRequest,
  GetUserResponse,
  GetUsersByIdsRequest,
  GetUsersByIdsResponse,
  ListCartRequest,
  ListCartResponse,
  ListWishlistRequest,
  ListWishlistResponse,
  RegisterInstructorRequest,
  RegisterInstructorResponse,
  RemoveFromCartRequest,
  RemoveFromCartResponse,
  RemoveFromWishlistRequest,
  RemoveFromWishlistResponse,
  ToggleCartItemRequest,
  ToggleCartItemResponse,
  ToggleWishlistItemRequest,
  ToggleWishlistItemResponse,
  UnBlockUserRequest,
  UnBlockUserResponse,
  UpdateUserDetailsRequest,
  UpdateUserDetailsResponse,
  UserServiceClient,
} from './proto/generated/user_service';
import { config } from '@/config';

export class UserService {
  private readonly client: GrpcClient<UserServiceClient>;
  private static instance: UserService;

  private constructor() {
    const [host = 'localhost', port = '50052'] =
      config.grpc.services.userServiceClient.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(__dirname, 'proto', 'user_service.proto'),
      packageName: 'user_service',
      serviceName: 'UserService',
      host,
      port: parseInt(port),
    });
  }

  // Singleton pattern
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public static async shutdown(): Promise<void> {
    if (UserService.instance) {
      try {
        UserService.instance.close();
      } finally {
        // no-op
      }
    }
  }

  async registerInstructor(
    request: RegisterInstructorRequest,
    options: GrpcClientOptions = {}
  ): Promise<RegisterInstructorResponse> {
    const response = await this.client.unaryCall(
      'registerInstructor',
      request,
      options
    );
    return response as RegisterInstructorResponse;
  }

  async checkUserEmailExists(
    request: CheckUserByEmailRequest,
    options: GrpcClientOptions = {}
  ): Promise<CheckUserByEmailResponse> {
    const response = await this.client.unaryCall(
      'checkUserEmailExist',
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
      'getAllUserEmails',
      request,
      options
    );
    return response as GetAllUserEmailsResponse;
  }

  async getUser(
    request: GetUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetUserResponse> {
    const response = await this.client.unaryCall('getUser', request, options);
    return response as GetUserResponse;
  }

  async updateUserDetails(
    request: UpdateUserDetailsRequest,
    options: GrpcClientOptions = {}
  ): Promise<UpdateUserDetailsResponse> {
    const response = await this.client.unaryCall(
      'updateUserDetails',
      request,
      options
    );
    return response as UpdateUserDetailsResponse;
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

  async getCurrentUser(
    request: GetCurrentUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetCurrentUserResponse> {
    const response = await this.client.unaryCall(
      'getCurrentUser',
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
      'getAllUsers',
      request,
      options
    );
    return response as GetAllUsersResponse;
  }
  async getUsersByIds(
    request: GetUsersByIdsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetUsersByIdsResponse> {
    const response = await this.client.unaryCall(
      'getUsersByIds',
      request,
      options
    );
    return response as GetUsersByIdsResponse;
  }
  async getUserWishlist(
    request: ListWishlistRequest,
    options: GrpcClientOptions = {}
  ): Promise<ListWishlistResponse> {
    const response = await this.client.unaryCall(
      'listUserWishlist',
      request,
      options
    );
    return response as ListWishlistResponse;
  }
  async addToWishlist(
    request: AddToWishlistRequest,
    options: GrpcClientOptions = {}
  ): Promise<AddToWishlistResponse> {
    const response = await this.client.unaryCall(
      'addToWishlist',
      request,
      options
    );
    return response as AddToWishlistResponse;
  }
  async removeFromWishlist(
    request: RemoveFromWishlistRequest,
    options: GrpcClientOptions = {}
  ): Promise<RemoveFromWishlistResponse> {
    const response = await this.client.unaryCall(
      'removeFromWishlist',
      request,
      options
    );
    return response as RemoveFromWishlistResponse;
  }
  async getUserCart(
    request: ListCartRequest,
    options: GrpcClientOptions = {}
  ): Promise<ListCartResponse> {
    const response = await this.client.unaryCall(
      'listUserCart',
      request,
      options
    );
    return response as ListCartResponse;
  }
  async addToCart(
    request: AddToCartRequest,
    options: GrpcClientOptions = {}
  ): Promise<AddToCartResponse> {
    const response = await this.client.unaryCall('addToCart', request, options);
    return response as AddToCartResponse;
  }
  async toggleCartItem(
    request: ToggleCartItemRequest,
    options: GrpcClientOptions = {}
  ): Promise<ToggleCartItemResponse> {
    const response = await this.client.unaryCall(
      'toggleCartItem',
      request,
      options
    );
    return response as ToggleCartItemResponse;
  }
  async toggleWishlistItem(
    request: ToggleWishlistItemRequest,
    options: GrpcClientOptions = {}
  ): Promise<ToggleWishlistItemResponse> {
    const response = await this.client.unaryCall(
      'toggleWishlistItem',
      request,
      options
    );
    return response as ToggleWishlistItemResponse;
  }
  async removeFromCart(
    request: RemoveFromCartRequest,
    options: GrpcClientOptions = {}
  ): Promise<RemoveFromCartResponse> {
    const response = await this.client.unaryCall(
      'removeFromCart',
      request,
      options
    );
    return response as RemoveFromCartResponse;
  }

  close() {
    this.client.close();
  }
}
