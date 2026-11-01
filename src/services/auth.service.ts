import { api } from "../utils/index.js";
import type {
  ApiBodylessRequestOptions,
  LoginRequest,
  GoogleLoginRequest,
  LoginResponse,
  PasswordRecoveryRequest,
  RefreshRequest,
  ResetPasswordRequest,
  UserRegisterRequest,
  UserResponse,
  VerifyPasswordRecoveryCodeRequest,
} from "../types/index.js";
import { loginResponseSchema, userResponseSchema } from "../schemas/index.js";

export class AuthService {
  async register(
    body: UserRegisterRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.post<UserResponse, UserRegisterRequest>(
      "/auth/register",
      body,
      { ...options, responseSchema: userResponseSchema },
    );
  }

  async login(
    body: LoginRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<LoginResponse> {
    return api.post<LoginResponse, LoginRequest>("/auth/login", body, {
      ...options,
      responseSchema: loginResponseSchema,
    });
  }

  async loginWithGoogle(
    body: Pick<GoogleLoginRequest, "idToken">,
    options?: ApiBodylessRequestOptions,
  ): Promise<LoginResponse> {
    return api.post<
      LoginResponse,
      Pick<GoogleLoginRequest, "idToken">
    >(
      "/auth/google",
      body,
      { ...options, responseSchema: loginResponseSchema },
    );
  }

  async refreshToken(
    refreshToken?: string,
    options?: ApiBodylessRequestOptions,
  ): Promise<LoginResponse> {
    const payload: RefreshRequest = refreshToken ? { refreshToken } : {};
    return api.post<LoginResponse, RefreshRequest>(
      "/auth/refresh",
      payload,
      { ...options, responseSchema: loginResponseSchema },
    );
  }

  async logout(
    refreshToken?: string,
    options?: ApiBodylessRequestOptions,
  ): Promise<void> {
    const payload: RefreshRequest = refreshToken ? { refreshToken } : {};
    return api.post<void, RefreshRequest>("/auth/logout", payload, options);
  }

  async requestPasswordRecovery(
    body: PasswordRecoveryRequest,
  ): Promise<void> {
    return api.post<void, PasswordRecoveryRequest>("/auth/forgot-password", body);
  }

  async resetPassword(body: ResetPasswordRequest): Promise<void> {
    return api.post<void, ResetPasswordRequest>("/auth/reset-password", body);
  }

  async verifyPasswordRecoveryCode(
    body: VerifyPasswordRecoveryCodeRequest,
  ): Promise<void> {
    return api.post<void, VerifyPasswordRecoveryCodeRequest>(
      "/auth/verify-reset-code",
      body,
    );
  }
}

export const authService = new AuthService();
