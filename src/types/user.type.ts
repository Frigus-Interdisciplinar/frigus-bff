export type AccountType = "DOMESTIC" | "BUSINESS" | "COMMERCIAL";

export type Role = "USER" | "ADMIN";

export interface UserResponse {
  id: string;
  name: string;
  email: string;
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
