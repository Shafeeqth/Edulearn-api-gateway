import { UserService } from "../../../clients/user";
import { Request, Response } from "express";
import { HttpStatus, Time } from "@mdshafeeq-repo/edulearn-common";
import validateSchema from "../../../../services/validate-schema";
import { RegisterUserSchema } from "../../../../domains/user/validator-schemas/register-user.schema";
import { LoginUserSchema } from "../../../../domains/user/validator-schemas/login-user.schema";
import { ResponseWrapper } from "../../../../utils/response-wrapper";
import {
  accessTokenOptions,
  refreshTokenOptions,
} from "../../../../domains/user/utils/token-options";
import { AuthenticationError } from "../../../../utils/errors/unauthenticate.error";
import { Metadata } from "@grpc/grpc-js";
import { NotificationService } from "../../../../domains/clients/notification";
import { VerifyUserSchema } from "../../../../domains/user/validator-schemas/verify-user.schema";
import { ResendOtpSchema } from "../../../../domains/user/validator-schemas/resend-otp.schema";

export class UserController {
  private userService: UserService;
  private notificationService: NotificationService;

  constructor() {
    this.userService = new UserService("localhost", 50051);
    this.notificationService = new NotificationService("localhost", 50052);
  }

  async getCurrentUser(req: Request, res: Response) {
    // Retrieve refresh token from the cookies
    console.log("cookies (:) ", JSON.stringify(req.cookies, null, 2));
    let accessToken = req.cookies?.["access-token"];
    console.log("refresh-token (:)", accessToken);
    if (!accessToken) throw new AuthenticationError();

    // create metadata object to pass req headers
    const metadata = new Metadata();
    metadata.set("x-user", JSON.stringify(req.user)); // send user data in `x-user` header

    const serverResponse = await this.userService.getCurrentUser(
      {userId: req.user?.userId!},
      { metadata }
    );
    console.log("Response from server =:)", JSON.stringify(serverResponse, null , 2))
    const resWrap = new ResponseWrapper(res);
    // resWrap.cookie(
    //   "refresh-token",
    //   serverResponse.success!.refreshToken,
    //   refreshTokenOptions as ITokenOptions
    // );
    // resWrap.cookie(
    //   "access-token",
    //   serverResponse.success!.accessToken,
    //   accessTokenOptions as ITokenOptions
    // );
    return resWrap.status(HttpStatus.OK).success(serverResponse.user, "User response fetched successfully");
  }

  
}
