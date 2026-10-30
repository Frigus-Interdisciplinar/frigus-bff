export type AccountType = "DOMESTIC" | "BUSINESS" | "COMMERCIAL";

export type Role = "USER" | "ADMIN";

export interface UserResponse {
  id: string;
  name: string;
  profilePictureUrl?: string | null;
  email: string;
  emailVerified?: boolean;
  planSelectionRequired?: boolean;
  pendingPlanTransactionId?: string | null;
  accountType: AccountType;
  birthDate: string;
}

export interface UserPutRequest {
  name: string;
  birthDate: string;
}

export interface UserPatchRequest {
  name?: string;
  birthDate?: string;
  profilePictureUrl?: string;
}

export interface UserChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UserAdminResetPasswordRequest {
  newPassword: string;
}

export interface UserRoleUpdateRequest {
  role: Role;
}

export interface UserAccountTypeUpdateRequest {
  accountType: AccountType;
}
