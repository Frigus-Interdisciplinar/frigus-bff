import { api } from "../utils/index.js";
import type {
  ApiBodylessRequestOptions,
  UserChangePasswordRequest,
  UserPatchRequest,
  UserPutRequest,
  UserResponse,
} from "../types/index.js";

// servico de comunicacao com os endpoints de perfil da core-api
export class ProfileService {
  async getProfile(options?: ApiBodylessRequestOptions): Promise<UserResponse> {
    return api.get<UserResponse>("/profile", options);
  }

  async updateProfile(
    body: UserPutRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.put<UserResponse, UserPutRequest>("/profile", body, options);
  }

  async patchProfile(
    body: UserPatchRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.patch<UserResponse, UserPatchRequest>("/profile", body, options);
  }

  async changePassword(
    body: UserChangePasswordRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<void> {
    return api.patch<void, UserChangePasswordRequest>(
      "/profile/password",
      body,
      options,
    );
  }

  async deleteCurrentUser(options?: ApiBodylessRequestOptions): Promise<void> {
    return api.delete<void>("/profile", options);
  }
}

export const profileService = new ProfileService();
