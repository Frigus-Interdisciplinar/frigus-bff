import { api } from "../utils/index.js";
import type {
  ApiBodylessRequestOptions,
  LoginRequest,
  LoginResponse,
  PasswordRecoveryRequest,
  RefreshRequest,
  ResetPasswordRequest,
  UserRegisterRequest,
  UserResponse,
  VerifyPasswordRecoveryCodeRequest,
} from "../types/index.js";

// servico de comunicacao com os endpoints de autenticacao da core-api
export class AuthService {
  async register(
    body: UserRegisterRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.post<UserResponse, UserRegisterRequest>(
      "/auth/register",
      body,
      options,
    );
  }

  async login(
    body: LoginRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<LoginResponse> {
    return api.post<LoginResponse, LoginRequest>("/auth/login", body, options);
  }

  async refreshToken(
    refreshToken?: string,
    options?: ApiBodylessRequestOptions,
  ): Promise<LoginResponse> {
    const payload: RefreshRequest = refreshToken ? { refreshToken } : {};
    return api.post<LoginResponse, RefreshRequest>(
      "/auth/refresh",
      payload,
      options,
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
