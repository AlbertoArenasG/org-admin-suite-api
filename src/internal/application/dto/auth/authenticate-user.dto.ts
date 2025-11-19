import { UserRole, UserStatus } from '@domain/entities';
import { PhoneDto } from '@application/dto/shared';

export interface AuthenticateUserDto {
  email: string;
  password: string;
}

export interface AuthenticatedUserDto {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  cellPhone: PhoneDto;
}

export interface AuthenticateUserResultDto {
  user: AuthenticatedUserDto;
  accessToken: string;
}
