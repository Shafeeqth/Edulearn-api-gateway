import { UserService } from "../../../clients/user";
import { Request, Response } from "express";
import { HttpStatus, Time } from "@mdshafeeq-repo/edulearn-common";
import validateSchema from "../../../../services/validate-schema";
import { RegisterUserSchema } from "../../../user/validator-schemas/auth/register-user.schema";
import { LoginUserSchema } from "../../../../domains/user/validator-schemas/auth/login-user.schema";
import { ResponseWrapper } from "../../../../utils/response-wrapper";
import {
  accessTokenOptions,
  refreshTokenOptions,
} from "../../../../domains/user/utils/token-options";
import { AuthenticationError } from "../../../../utils/errors/unauthenticate.error";
import { Metadata } from "@grpc/grpc-js";
import { NotificationService } from "../../../../domains/clients/notification";
import { VerifyUserSchema } from "../../../user/validator-schemas/auth/verify-user.schema";
import { ResendOtpSchema } from "../../../user/validator-schemas/auth/resend-otp.schema";
import { changePasswordSchema } from "../../../../domains/user/validator-schemas/user/change-password.schema";
import { blockUserSchema } from "../../../../domains/user/validator-schemas/user/block-user.schema";
import { MetadataManager } from "../../../../domains/user/utils/metadata-manager";

export class AdminController {
  private userService: UserService;
  private notificationService: NotificationService;

  constructor() {
    this.userService = new UserService("localhost", 50051);
    this.notificationService = new NotificationService("localhost", 50052);
  }

  async blockUser(req: Request, res: Response) {
    // Retrieve refresh token from the cookies
    console.log("cookies (:) ", JSON.stringify(req.cookies, null, 2));
    let accessToken = req.cookies?.["access-token"];
    console.log("refresh-token (:)", accessToken);
    if (!accessToken) throw new AuthenticationError();

    const schemaResponse = validateSchema(req.body, blockUserSchema)!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user }); // send user data in `x-user` header

    const serverResponse = await this.userService.blockUser(schemaResponse, {
      metadata: metadata.metadata,
    });
    console.log(
      "Response from server =:)",
      JSON.stringify(serverResponse, null, 2)
    );
    const resWrap = new ResponseWrapper(res);

    return resWrap
      .status(HttpStatus.OK)
      .success({ updated: true }, "Use has been blocker successfully");
  }

  async getAllUsers(req: Request, res: Response) {
    // Retrieve refresh token from the cookies

    const page = parseInt(req.params.page || "0");
    const pageSize = parseInt(req.params.pageSize || "0");
    let accessToken = req.cookies?.["access-token"];
    console.log("refresh-token (:)", accessToken);
    if (!accessToken) throw new AuthenticationError();

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ "x-user": req.user }); // send user data in `x-user` header

    const serverResponse = await this.userService.getAllUsers(
      { pagination: { page, pageSize } },
      { metadata: metadata.metadata }
    );
    console.log(
      "Response from server =:)",
      JSON.stringify(serverResponse, null, 2)
    );
    const resWrap = new ResponseWrapper(res);

    return resWrap
      .status(HttpStatus.OK)
      .success(serverResponse.success, "User response fetched successfully");
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
