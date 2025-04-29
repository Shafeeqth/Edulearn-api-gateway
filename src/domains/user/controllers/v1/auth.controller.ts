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

export class AuthController {
  private userService: UserService;
  private notificationService: NotificationService;

  constructor() {
    this.userService = new UserService("localhost", 50051);
    this.notificationService = new NotificationService("localhost", 50052);
  }

  async registerUser(req: Request, res: Response) {
    console.log("received request from (:)", req.ip);
    console.log("\n " + JSON.stringify(req.body, null, 2));

    const { email, password, role, avatar, username } = validateSchema(
      req.body,
      RegisterUserSchema
    )!;
    console.log(validateSchema);

    const response = await this.userService.registerUser({
      avatar,
      email,
      password,
      username,
      role,
    });

    console.log("response from register :))", response);

    const isOtpSend = await this.notificationService.sendOtp({
      email,
      userId: response.userId!,
      username,
    });

    console.log("OTP send response", isOtpSend);

    console.info("Otp send successfully =:)");
    const resWrap = new ResponseWrapper(res);
    resWrap.status(HttpStatus.OK).success(response, "OTP send successfully");
  }

  async resendOtp(req: Request, res: Response) {
    console.log("received request from (:)", req.ip);
    console.log("\n " + JSON.stringify(req.body, null, 2));

    const { email } = validateSchema(req.body, ResendOtpSchema)!;
    console.log(validateSchema);

    const { message, success } = await this.notificationService.sendOtp({
      email,
      userId: "",
      username: "",
    });
    const resWrap = new ResponseWrapper(res);
    if (!success) {
      return resWrap
        .status(HttpStatus.BAD_REQUEST)
        .error("OTPResendError", message, "Can't send OTP");
    }
    resWrap.status(HttpStatus.OK).success({}, message);
  }

  async verifyUser(req: Request, res: Response) {
    console.log("received request from (:)", req.ip);
    console.log("\n " + JSON.stringify(req.body, null, 2));

    const { email, code } = validateSchema(req.body, VerifyUserSchema)!;
    console.log(validateSchema);

    const { message, success } = await this.notificationService.verifyOtp({
      email,
      otp: code,
    });
    const resWrap = new ResponseWrapper(res);
    if (!success) {
      return resWrap
        .status(HttpStatus.BAD_REQUEST)
        .error(
          "VerificationFailed",
          message,
          "OTP has been mismatch or expired, please try again"
        );
    }
    console.info("Otp has verified successfully =:)");
    const verifyResponse = await this.userService.verifyUser({ email });
    console.log(
      "Verify response from user service =:)",
      JSON.stringify(verifyResponse, null, 2)
    );
    resWrap.cookie(
      "refresh-token",
      verifyResponse.success!.refreshToken,
      refreshTokenOptions as ITokenOptions
    );
    resWrap.cookie(
      "access-token",
      verifyResponse.success!.accessToken,
      accessTokenOptions as ITokenOptions
    );
    return resWrap
      .status(HttpStatus.OK)
      .success(verifyResponse.success, "Verification successful");
  }

  /**
   * Login user with credentials
   * @param req
   * @param res
   * @returns
   */

  async loginUser(req: Request, res: Response) {
    const { email, password , authType} = validateSchema(req.body, LoginUserSchema)!;
    console.log(validateSchema);

    const serverResponse = await this.userService.loginUser({
      email,
      password: password || "",

    });
    const resWrap = new ResponseWrapper(res);
    resWrap.cookie(
      "refresh-token",
      serverResponse.success!.refreshToken,
      refreshTokenOptions as ITokenOptions
    );
    resWrap.cookie(
      "access-token",
      serverResponse.success!.accessToken,
      accessTokenOptions as ITokenOptions
    );
    return resWrap.status(HttpStatus.OK).json({ message: "Login successful" });
  }

  async getNewRefreshToken(req: Request, res: Response) {
    // Retrieve refresh token from the cookies
    console.log("cookies (:) ", JSON.stringify(req.cookies, null, 2));
    let refreshToken = req.cookies?.["refresh-token"];
    console.log("refresh-token (:)", refreshToken);
    if (!refreshToken) throw new AuthenticationError();

    // create metadata object to pass req headers
    const metadata = new Metadata();
    metadata.set("x-user", JSON.stringify(req.user)); // send user data in `x-user` header

    const serverResponse = await this.userService.getNewRefreshToken(
      {
        refreshToken,
      },
      { metadata }
    );
    const resWrap = new ResponseWrapper(res);
    resWrap.cookie(
      "refresh-token",
      serverResponse.success!.refreshToken,
      refreshTokenOptions as ITokenOptions
    );
    resWrap.cookie(
      "access-token",
      serverResponse.success!.accessToken,
      accessTokenOptions as ITokenOptions
    );
    return resWrap.status(HttpStatus.OK).json({ message: "Login successful" });
  }
}
