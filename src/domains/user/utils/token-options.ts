import { Time } from "@mdshafeeq-repo/edulearn-common";
import { config } from "../../../config";

const accessTokenOptions: ITokenOptions = {
  expires: new Date(
    Date.now() + Time.DAYS * parseInt(config.accessTokenExpiry),
    10
  ),
  httpOnly: config.nodeEnv === "production",
  maxAge: Time.DAYS * parseInt(config.accessTokenExpiry),
  sameSite: "lax",
  secure: true,
};

const refreshTokenOptions: ITokenOptions = {
  expires: new Date(
    Date.now() + Time.DAYS * parseInt(config.refreshTokenExpiry),
    10
  ),
  httpOnly: config.nodeEnv === "production",
  maxAge: Time.DAYS * parseInt(config.refreshTokenExpiry),
  sameSite: "lax",
  secure: true,
};

export { accessTokenOptions, refreshTokenOptions };
