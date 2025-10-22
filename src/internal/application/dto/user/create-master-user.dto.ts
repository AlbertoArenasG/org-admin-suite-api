import { UserRole, UserStatus } from '@domain/entities';
import { PhoneDto } from '@application/dto/shared';

export interface CreateMasterUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole;
  cellPhone: PhoneDto;
}

export interface CreateMasterUserResultDto {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  cellPhone: PhoneDto;
  createdAt: Date;
}
