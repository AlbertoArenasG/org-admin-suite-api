import { UserRole } from '@domain/entities';
import { PhoneDto } from '@application/dto/shared';
import { UserViewDto } from './create-user.dto';

export interface CreateMasterUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole;
  cellPhone: PhoneDto;
}

export type CreateMasterUserResultDto = UserViewDto;
