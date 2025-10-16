import { UserStatus, UserRole } from '@src/internal/domain/entities';

export interface CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateUserResultDto {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}
