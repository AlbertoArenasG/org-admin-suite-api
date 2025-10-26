import { UserRole, UserStatus } from '@domain/entities';
import { PhoneDto } from '@application/dto/shared';
import { UserViewDto } from './create-user.dto';

export interface UpdateUserDto {
  userId: string;
  actorRole: UserRole;
  actorUserId: string;
  payload: {
    name?: string;
    lastname?: string;
    email?: string;
    cellPhone?: PhoneDto | null;
    role?: UserRole;
    status?: UserStatus;
  };
}

export type UpdateUserResultDto = UserViewDto;

export interface UpdateMyProfileDto {
  userId: string;
  name?: string;
  lastname?: string;
  cellPhone?: PhoneDto | null;
  password?: string;
}

export type UpdateMyProfileResultDto = UserViewDto;

export interface DeleteUserDto {
  userId: string;
  actorRole: UserRole;
}
