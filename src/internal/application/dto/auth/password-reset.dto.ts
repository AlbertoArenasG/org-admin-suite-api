export interface RequestPasswordResetDto {
  email: string;
}

export interface ResetUserPasswordDto {
  token: string;
  password: string;
}
