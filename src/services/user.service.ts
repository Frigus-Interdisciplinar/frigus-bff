import { api } from "../utils/index.js";
import type {
  ApiBodylessRequestOptions,
  PageableParams,
  PageResponse,
  UserAccountTypeUpdateRequest,
  UserAdminResetPasswordRequest,
  UserRoleUpdateRequest,
  UserResponse,
} from "../types/index.js";

// servico de administracao de usuarios na core-api
export class UserService {
  async findAll(
    params?: PageableParams,
    options?: ApiBodylessRequestOptions,
  ): Promise<PageResponse<UserResponse>> {
    return api.get<PageResponse<UserResponse>>("/user", {
      ...options,
      params: {
        ...options?.params,
        ...params,
      },
    });
  }

  async findById(
    id: string,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.get<UserResponse>(`/user/${id}`, options);
  }

  async findByEmail(
    email: string,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.get<UserResponse>("/user/search", {
      ...options,
      params: {
        ...options?.params,
        email,
      },
    });
  }

  async updateRole(
    id: string,
    body: UserRoleUpdateRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.patch<UserResponse, UserRoleUpdateRequest>(
      `/user/${id}/role`,
      body,
      options,
    );
  }

  async updateAccountType(
    id: string,
    body: UserAccountTypeUpdateRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.patch<UserResponse, UserAccountTypeUpdateRequest>(
      `/user/${id}/account-type`,
      body,
      options,
    );
  }

  async adminResetPassword(
    id: string,
    body: UserAdminResetPasswordRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<void> {
    return api.patch<void, UserAdminResetPasswordRequest>(
      `/user/${id}/password`,
      body,
      options,
    );
  }

  async deleteUser(
    id: string,
    options?: ApiBodylessRequestOptions,
  ): Promise<void> {
    return api.delete<void>(`/user/${id}`, options);
  }
}

export const userService = new UserService();
