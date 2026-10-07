import type { UserResponse } from "./user.type.js";

export interface LoginRequest {
  email: string;
  rawPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface UserRegisterRequest {
  name: string;
  birthDate: string;
  email: string;
  rawPassword: string;
}

export interface RefreshRequest {
  refreshToken?: string;
}

export interface PasswordRecoveryRequest {
  email: string;
}

export interface VerifyPasswordRecoveryCodeRequest extends PasswordRecoveryRequest {
  code: string;
}

export interface ResetPasswordRequest extends VerifyPasswordRecoveryCodeRequest {
  newPassword: string;
}
