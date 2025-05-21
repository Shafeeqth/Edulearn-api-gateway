import { UserService } from "../../../clients/user";
import { Request, Response } from "express";
import { HttpStatus } from "@mdshafeeq-repo/edulearn-common";
import validateSchema from "../../../../services/validate-schema";
import { ResponseWrapper } from "../../../../utils/response-wrapper";

import { NotificationService } from "../../../../domains/clients/notification";
import { changePasswordSchema } from "../../../../domains/user/validator-schemas/user/change-password.schema";
import { blockUserSchema } from "../../../../domains/user/validator-schemas/user/block-user.schema";
import {
  GetDetailedUserResponse,
  UserInfo,
} from "../../../../domains/clients/user/proto/generated/user";
import {
  AsObject,
  protoTimestampToDate,
} from "../../../../utils/time-converters/proto-timestamp-converters";
import { updateUserSchema } from "../../../../domains/user/validator-schemas/user/update-user.schema";
import { unBlockUserSchema } from "../../../../domains/user/validator-schemas/user/unblock-user.schema";
import { detailedUserSchema } from "../../../../domains/user/validator-schemas/user/detailed-user.schema";
import { MetadataManager } from "../../../../utils/metadata-manager";

export class UserController {
  private userService: UserService;
  private notificationService: NotificationService;

  constructor() {
    this.userService = new UserService("localhost", 50051);
    this.notificationService = new NotificationService("localhost", 50052);
  }

  async changePassword(req: Request, res: Response) {
    console.log("change password body :)", req.body);
    const schemaResponse = validateSchema(
      { ...req.body, ...req.params },
      changePasswordSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const serverResponse = await this.userService.changePassword(
      schemaResponse,
      { metadata: metadata.metadata }
    );
    console.log(
      "Response from server =:)",
      JSON.stringify(serverResponse, null, 2)
    );
    const resWrap = new ResponseWrapper(res);

    return resWrap
      .status(HttpStatus.OK)
      .success({ updated: true }, "Password has been updated successfully");
  }

  async blockUser(req: Request, res: Response) {
    const { userId } = validateSchema(req.body, blockUserSchema)!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const serverResponse = await this.userService.blockUser(
      { userId },
      {
        metadata: metadata.metadata,
      }
    );

    const resWrap = new ResponseWrapper(res);

    return resWrap
      .status(HttpStatus.OK)
      .success({ updated: true }, "Use has been blocked successfully");
  }
  async unBlockUser(req: Request, res: Response) {
    const { userId } = validateSchema(req.body, unBlockUserSchema)!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const serverResponse = await this.userService.unBlockUser(
      { userId },
      {
        metadata: metadata.metadata,
      }
    );

    const resWrap = new ResponseWrapper(res);

    return resWrap
      .status(HttpStatus.OK)
      .success({ updated: true }, "Use has been UnBlocked successfully");
  }
  async registerInstructor(req: Request, res: Response) {
    // const { userId } = validateSchema(req.body, unBlockUserSchema)!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const serverResponse = await this.userService.registerInstructor(
      { userId: req.user!.userId! },
      {
        metadata: metadata.metadata,
      }
    );

    const resWrap = new ResponseWrapper(res);

    return resWrap
      .status(HttpStatus.OK)
      .success(serverResponse, "Use has been UnBlocked successfully");
  }

  async getDetailedUser(req: Request, res: Response) {
    const { userId } = validateSchema(req.params, detailedUserSchema)!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const user = await this.userService.getDetailedUser(
      { userId },
      { metadata: metadata.metadata }
    );

    console.log("Response form server", JSON.stringify(user, null, 2));

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .sendWithMapping<GetDetailedUserResponse, GetDetailedUserResponse>(
        user!,
        {
          fields: {
            firstName: "firstName",
            lastName: "lastName",
            userId: "userId",
            role: "role",
            avatar: "avatar",
            status: "status",
            biography: "biography",
            facebook: "facebook",
            headline: "headline",
            instagram: "instagram",
            language: "language",
            linkedin: "linkedin",
            website: "website",
            phone: "phone",
            email: "email",
            updatedAt: () =>
              protoTimestampToDate(user!.updatedAt as unknown as AsObject),
            createdAt: () =>
              protoTimestampToDate(user!.createdAt as unknown as AsObject),
          },
        },
        "Fetched user data successfully"
      );
  }
  async getCurrentUser(req: Request, res: Response) {
    // const { userId } = validateSchema(req.body, currentUserSchema)!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const { user } = await this.userService.getCurrentUser(
      { userId: req.user!.userId },
      { metadata: metadata.metadata }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .sendWithMapping<UserInfo, UserInfo>(
        user!,
        {
          fields: {
            username: "username",
            userId: "userId",
            email: "email",
            role: "role",
            avatar: "avatar",
            status: "status",
            updatedAt: () =>
              protoTimestampToDate(user!.updatedAt as unknown as AsObject),
            createdAt: () =>
              protoTimestampToDate(user!.createdAt as unknown as AsObject),
          },
        },
        "Fetched current user data successfully"
      );
  }

  async getAllUsers(req: Request, res: Response) {
    // Retrieve refresh token from the cookies

    const page = parseInt(req.params.page || "0");
    const pageSize = parseInt(req.params.pageSize || "0");

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const serverResponse = await this.userService.getAllUsers(
      { pagination: { page, pageSize } },
      { metadata: metadata.metadata }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(serverResponse.success, "User response fetched successfully");
  }

  async updateUserData(req: Request, res: Response) {
    console.log("User body", JSON.stringify(req.body, null, 2));
    const validatedUserData = validateSchema(
      { ...req.body, ...req.params },
      updateUserSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const serverResponse = await this.userService.updateUserDetails(
      validatedUserData,
      { metadata: metadata.metadata }
    );

    console.log("server response", serverResponse);
    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(serverResponse.success, "User response fetched successfully");
  }

  async get(req: Request, res: Response) {
    // Retrieve refresh token from the cookies

    const page = parseInt(req.params.page || "0");
    const pageSize = parseInt(req.params.pageSize || "0");

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header

    const serverResponse = await this.userService.getAllUsers(
      { pagination: { page, pageSize } },
      { metadata: metadata.metadata }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(serverResponse.success, "User response fetched successfully");
  }
}
