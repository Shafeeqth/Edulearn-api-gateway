import { UserInfo } from "../../service-clients/user/proto/generated/user";

export interface IUser {
  id: string;
  email: string;
  role: UserRoles;
  firstName?: string;
  lastName?: string;
  password?: string;
  status: UserStatus;
  avatar?: string;
  authType?: AuthType;
  phone?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

export interface IAuthTokens {
  refreshToken: string;
  accessToken: string;
}

export enum UserStatus {
  VERIFIED = "verified",
  NOT_VERIFIED = "not-verified",
  ACTIVE = "active",
  NOT_ACTIVE = "not-active",
  BLOCKED = "blocked",
}

export enum UserRoles {
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  USER = "user",
}

export enum AuthType {
  EMAIL = "email",
  OAUTH_2 = "oauth-2",
}

export interface IUserWithAuthToken extends IAuthTokens {
  user: UserInfo;
}
