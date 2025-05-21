import { UserService } from "../../../clients/user";
import { Request, Response } from "express";
import { HttpStatus, Time } from "@mdshafeeq-repo/edulearn-common";
import validateSchema from "../../../../services/validate-schema";
import { RegisterUserSchema } from "../../validator-schemas/auth/register-user.schema";
import { LoginUserSchema } from "../../../../domains/user/validator-schemas/auth/login-user.schema";
import { ResponseWrapper } from "../../../../utils/response-wrapper";
import {
  accessTokenOptions,
  refreshTokenOptions,
} from "../../../../domains/user/utils/token-options";
import { NotificationService } from "../../../../domains/clients/notification";
import { VerifyUserSchema } from "../../validator-schemas/auth/verify-user.schema";
import { ResendOtpSchema } from "../../validator-schemas/auth/resend-otp.schema";
import { Auth2SignSchema } from "../../../../domains/user/validator-schemas/auth/auth2-sign.schema";
import { LogoutUserSchema } from "../../validator-schemas/auth/logout.schema";
import {
  Auth2SignResponse,
  UserInfo,
  VerifySuccess,
} from "../../../../domains/clients/user/proto/generated/user";
import { IUserWithAuthToken } from "../../../../domains/user/types";
import { ResponseMapper } from "../../../../utils/response-mapper";
import {
  AsObject,
  protoTimestampToDate,
} from "../../../../utils/time-converters/proto-timestamp-converters";
import { refreshTokenSchema } from "../../../../domains/user/validator-schemas/auth/refresh-token.schema";
import { EmailAvailabilityService } from "../../../../services/bloom-filter/email-availability";
import redisClient from "../../../../utils/redis";
import { emailAvailabilitySchema } from "../../../../domains/user/validator-schemas/auth/email-availability.schema";

export class AuthController {
  private userService: UserService;
  private notificationService: NotificationService;
  private emailAvailabilityService: EmailAvailabilityService;

  constructor() {
    this.userService = new UserService("localhost", 50051);
    this.notificationService = new NotificationService("localhost", 50052);

    this.emailAvailabilityService = new EmailAvailabilityService(
      redisClient.getClient(),
      {
        checkEmailExistInDB: this.userService.checkUserEmailExists,
        queryForEmails: this.userService.getAllUserEmails,
      }
    );
    // Initialize bloom filter

    this.emailAvailabilityService
      .initialize()
      .then(() => console.log("Email availability service initialized"))
      .catch((err) =>
        console.error(
          "Error while initializing Email availability service",
          err
        )
      );
  }

  async registerUser(req: Request, res: Response) {
    console.log("received request from (:)", req.ip);
    console.log("\n " + JSON.stringify(req.body, null, 2));

    const { email, password, role, avatar, username, authType } =
      validateSchema(req.body, RegisterUserSchema)!;
    console.log(validateSchema);

    const response = await this.userService.registerUser({
      avatar,
      email,
      password,
      username,
      role,
      authType,
    });

    console.log("response from register :)", response);

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

  async auth2Sign(req: Request, res: Response) {
    console.log("auth2 Signin " + JSON.stringify(req.body, null, 2));

    const { email, role, avatar, username, authType } = validateSchema(
      req.body,
      Auth2SignSchema
    )!;
    console.log(validateSchema);

    const serverResponse = await this.userService.auth2Sign({
      avatar,
      email,
      username,
      role,
      authType,
    });

    console.log("Server response :) ", JSON.stringify(serverResponse, null, 2));

    const resWrap = new ResponseWrapper(res);
    resWrap.cookie(
      "refresh-token",
      serverResponse!.refreshToken,
      refreshTokenOptions as ITokenOptions
    );
    resWrap.cookie(
      "access-token",
      serverResponse!.accessToken,
      accessTokenOptions as ITokenOptions
    );

    const userResponse = new ResponseMapper<UserInfo, UserInfo>({
      fields: {
        username: "username",
        userId: "userId",
        email: "email",
        role: "role",
        avatar: "avatar",
        status: "status",
        updatedAt: () =>
          protoTimestampToDate(
            serverResponse.user!.updatedAt as unknown as AsObject
          ),
        createdAt: () =>
          protoTimestampToDate(
            serverResponse.user!.createdAt as unknown as AsObject
          ),
      },
    });

    return resWrap
      .status(HttpStatus.OK)
      .sendWithMapping<
        Auth2SignResponse,
        IUserWithAuthToken
      >(serverResponse as Auth2SignResponse, {
        fields: {
          accessToken: () => serverResponse!.accessToken,
          refreshToken: () => serverResponse!.refreshToken,
        },
        nested: {
          user: userResponse,
        },
      });
  }

  async checkEmailAvailability(req: Request, res: Response) {
    const { email } = validateSchema(req.body, emailAvailabilitySchema)!;

    const isEmailAvailable =
      await this.emailAvailabilityService.isEmailAvailable(email);
    new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        { available: !!isEmailAvailable },
        isEmailAvailable ? "Email available" : "Email already taken"
      );
  }

  async resendOtp(req: Request, res: Response) {
    const { email } = validateSchema(req.body, ResendOtpSchema)!;

    const { message, success } = await this.notificationService.sendOtp({
      email,
      userId: "",
      username: "",
    });

    const resWrap = new ResponseWrapper(res);
    console.log(JSON.stringify({ message, success }, null, 2));
    if (!success) {
      return resWrap
        .status(HttpStatus.BAD_REQUEST)
        .error("OTPResendError", message, "Can't send OTP");
    }
    resWrap.status(HttpStatus.OK).success({}, message);
  }

  async verifyUser(req: Request, res: Response) {
    const { email, code } = validateSchema(req.body, VerifyUserSchema)!;

    const { message, success } = await this.notificationService.verifyOtp({
      email,
      otp: code,
    });
    const resWrap = new ResponseWrapper(res);

    // If the OTP is mismatched or expired we early return
    // Notify client the issue
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

    // Next round trip to user service to mark user as verified
    // And fetch user credentials
    // NB: Here you can use Async messaging instead of Sync but
    // for me I chose sync, so no need to make another login request after register
    // reduce user effort, round trip and fetch the user credentials
    const { success: successResponse, error } =
      await this.userService.verifyUser({ email })!;

    if (error) {
      resWrap.error(error.code, error.message, error.details);
    }

    // Update email into bloom filter
    this.emailAvailabilityService.addEmail(successResponse!.user!.email);

    resWrap.cookie(
      "refresh-token",
      successResponse!.refreshToken,
      refreshTokenOptions as ITokenOptions
    );
    resWrap.cookie(
      "access-token",
      successResponse!.accessToken,
      accessTokenOptions as ITokenOptions
    );

    const userResponse = new ResponseMapper<UserInfo, UserInfo>({
      fields: {
        username: "username",
        userId: "userId",
        email: "email",
        role: "role",
        avatar: "avatar",
        status: "status",
        updatedAt: () =>
          protoTimestampToDate(
            successResponse!.user!.updatedAt as unknown as AsObject
          ),
        createdAt: () =>
          protoTimestampToDate(
            successResponse!.user!.createdAt as unknown as AsObject
          ),
      },
    });

    return resWrap
      .status(HttpStatus.OK)
      .sendWithMapping<
        VerifySuccess,
        IUserWithAuthToken
      >(successResponse as VerifySuccess, {
        fields: {
          accessToken: () => successResponse!.accessToken,
          refreshToken: () => successResponse!.refreshToken,
        },
        nested: {
          user: userResponse,
        },
      });
  }

  /**
   * Login user with credentials
   * @param req
   * @param res
   * @returns
   */

  async loginUser(req: Request, res: Response) {
    const { email, password } = validateSchema(req.body, LoginUserSchema)!;
    console.log(validateSchema);

    const { success } = await this.userService.loginUser({
      email,
      password,
    });
    const resWrap = new ResponseWrapper(res);
    resWrap.cookie(
      "refresh-token",
      success!.refreshToken,
      refreshTokenOptions as ITokenOptions
    );
    resWrap.cookie(
      "access-token",
      success!.accessToken,
      accessTokenOptions as ITokenOptions
    );
    const userResponse = new ResponseMapper<UserInfo, UserInfo>({
      fields: {
        username: "username",
        userId: "userId",
        email: "email",
        role: "role",
        avatar: "avatar",
        status: "status",
        updatedAt: () =>
          protoTimestampToDate(success!.user!.updatedAt as unknown as AsObject),
        createdAt: () =>
          protoTimestampToDate(success!.user!.createdAt as unknown as AsObject),
      },
    });

    return resWrap
      .status(HttpStatus.OK)
      .sendWithMapping<
        VerifySuccess,
        IUserWithAuthToken
      >(success as VerifySuccess, {
        fields: {
          accessToken: () => success!.accessToken,
          refreshToken: () => success!.refreshToken,
        },
        nested: {
          user: userResponse,
        },
      });
  }

  async logoutUser(req: Request, res: Response) {
    console.log("\n " + JSON.stringify(req.body, null, 2));

    const { userId } = validateSchema(req.body, LogoutUserSchema)!;
    console.log(validateSchema);

    const serverResponse = await this.userService.logoutUser({
      userId,
    });

    const resWrap = new ResponseWrapper(res);
    resWrap.clearCookie("refresh-token", {});
    resWrap.clearCookie("access-token", {});
    return resWrap
      .status(HttpStatus.OK)
      .success(serverResponse, "user logged out successfully");
  }

  async getNewRefreshToken(req: Request, res: Response) {
    console.log("Refresh body", req.body);

    const { refreshToken } = validateSchema(req.body, refreshTokenSchema)!;
    

    const serverResponse = await this.userService.getNewRefreshToken({
      refreshToken,
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
}
