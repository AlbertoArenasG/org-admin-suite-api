import { SystemRole, UserRole, UserStatus } from '@domain/entities';
import { PhoneDto } from '@application/dto/shared';

export interface CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  systemRole: SystemRole;
  roleId: string | null;
  cellPhone: PhoneDto;
}

export interface UserViewDto {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  systemRole: SystemRole;
  roleId: string | null;
  status: UserStatus;
  cellPhone: PhoneDto;
  createdAt: Date;
}

export type CreateUserResultDto = UserViewDto;
