import { UserStatus, UserRole } from '@src/internal/domain/entities';
import { Phone } from '../../../domain/value-objects/common/cell-phone.value-object';

export interface CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole;
  cellPhone: Phone;
}

export interface CreateUserResultDto {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  cellPhone: Phone;
  createdAt: Date;
}
