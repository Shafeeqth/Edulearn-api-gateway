import { UserService } from "../../../clients/user";
import { Request, Response } from "express";
import { HttpStatus, Time } from "@mdshafeeq-repo/edulearn-common";
import validateSchema from "../../../../services/validate-schema";
import { ResponseWrapper } from "../../../../utils/response-wrapper";
import { AuthenticationError } from "../../../../utils/errors/unauthenticate.error";
import { NotificationService } from "../../../../domains/clients/notification";
import { blockUserSchema } from "../../../../domains/user/validator-schemas/user/block-user.schema";
import { MetadataManager } from "../../../../domains/user/utils/metadata-manager";
import {
  AsObject,
  protoTimestampToDate,
} from "../../../../utils/time-converters/proto-timestamp-converters";
import { UserInfo } from "../../../../domains/clients/user/proto/generated/user";
import { UserBlockService } from "../../../../services/user-blocklist.service";

export class AdminController {
  private userService: UserService;
  private notificationService: NotificationService;
  private userBlackListService: UserBlockService;

  constructor() {
    this.userService = new UserService("localhost", 50051);
    this.notificationService = new NotificationService("localhost", 50052);
    this.userBlackListService = new UserBlockService();
  }

  async blockUser(req: Request, res: Response) {
    // Retrieve refresh token from the cookies

    const schemaResponse = validateSchema(req.params, blockUserSchema)!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header({ "x-user": req.user, "correlationId": req.correlationId }); // send user data in `x-user` header

    const { error, success } = await this.userService.blockUser(
      schemaResponse,
      {
        metadata: metadata.metadata,
      }
    );
    console.log("Response from server =:)", JSON.stringify(success, null, 2));

    this.userBlackListService.blockUser(req.params.userId);

    const resWrap = new ResponseWrapper(res);

    return resWrap
      .status(HttpStatus.OK)
      .success({ updated: true }, "Use has been blocked successfully");
  }
  async unBlockUser(req: Request, res: Response) {
    // Retrieve refresh token from the cookies

    const schemaResponse = validateSchema(req.params, blockUserSchema)!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user` header({ "x-user": req.user, "correlationId": req.correlationId }); // send user data in `x-user` header

    const { error, success } = await this.userService.unBlockUser(
      schemaResponse,
      {
        metadata: metadata.metadata,
      }
    );
    console.log("Response from server =:)", JSON.stringify(success, null, 2));

    this.userBlackListService.unblockUser(req.params.userId);

    const resWrap = new ResponseWrapper(res);

    return resWrap
      .status(HttpStatus.OK)
      .success({ updated: true }, "Use has been blocked successfully");
  }

  async getAllUsers(req: Request, res: Response) {
    // Retrieve refresh token from the cookies

    const page = parseInt(req.params.page || "0");
    const pageSize = parseInt(req.params.pageSize || "0");

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user, correlationId: req.correlationId }); // send user data in `x-user`

    const { error, success: successResponse } =
      await this.userService.getAllUsers(
        { pagination: { page, pageSize } },
        { metadata: metadata.metadata }
      );
    console.log(
      "Response from server =:)",
      JSON.stringify(successResponse, null, 2)
    );

    const resWrap = new ResponseWrapper(res);
    if (error)
      resWrap.status(400).error(error.code, error.message, error.details);

    const { pagination, users } = successResponse!;

    return resWrap
      .status(HttpStatus.OK)
      .sendListWithMapping<UserInfo, UserInfo>(
        users,
        {
          fields: {
            userId: "userId",
            email: "email",
            username: "username",
            status: "status",
            avatar: "avatar",
            role: "role",
            createdAt: (user: UserInfo): Date =>
              protoTimestampToDate(user.createdAt as unknown as AsObject),
            updatedAt: (user: UserInfo): Date =>
              protoTimestampToDate(user.updatedAt as unknown as AsObject),
          },
        },
        "User response fetched successfully"
      );
  }

  // async getUser(req: Request, res: Response) {
  //   console.log(
  //     "Response from server =:)",
  //     JSON.stringify(serverResponse, null, 2)
  //   );
  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success(serverResponse.success, "User response fetched successfully");
  // }
}
