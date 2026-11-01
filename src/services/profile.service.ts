import { api } from "../utils/index.js";
import type {
  ApiBodylessRequestOptions,
  UserChangePasswordRequest,
  UserAccountTypeUpdateRequest,
  UserPatchRequest,
  UserPutRequest,
  UserResponse,
} from "../types/index.js";
import { userResponseSchema } from "../schemas/index.js";

export class ProfileService {
  async getProfile(options?: ApiBodylessRequestOptions): Promise<UserResponse> {
    return api.get<UserResponse>("/profile", { ...options, responseSchema: userResponseSchema });
  }

  async updateOnboardingAccountType(
    body: UserAccountTypeUpdateRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.patch<UserResponse, UserAccountTypeUpdateRequest>(
      "/profile/onboarding/account-type",
      body,
      { ...options, responseSchema: userResponseSchema },
    );
  }

  async updateProfile(
    body: UserPutRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.put<UserResponse, UserPutRequest>("/profile", body, { ...options, responseSchema: userResponseSchema });
  }

  async patchProfile(
    body: UserPatchRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<UserResponse> {
    return api.patch<UserResponse, UserPatchRequest>("/profile", body, { ...options, responseSchema: userResponseSchema });
  }

  async changePassword(
    body: UserChangePasswordRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<void> {
    return api.patch<void, UserChangePasswordRequest>(
      "/profile/password",
      body,
      { ...options, allowEmptyResponse: true },
    );
  }

  async deleteCurrentUser(options?: ApiBodylessRequestOptions): Promise<void> {
    return api.delete<void>("/profile", { ...options, allowEmptyResponse: true });
  }
}

export const profileService = new ProfileService();
