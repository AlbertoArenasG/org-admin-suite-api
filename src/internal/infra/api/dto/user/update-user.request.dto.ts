import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { SystemRole, User, UserRole, UserStatus } from '@domain/entities';
import { UpdateUserDto } from '@application/dto';
import { PhoneRequestDto } from '@infra/api/dto/shared';

const ALLOWED_STATUSES: UserStatus[] = [UserStatus.ACTIVE, UserStatus.INACTIVE];

export class UpdateUserRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Type(() => PhoneRequestDto)
  @ValidateNested()
  cell_phone?: PhoneRequestDto | null;

  @IsOptional()
  @IsIn(Object.values(UserRole))
  role_id?: UserRole;

  @IsOptional()
  @IsIn(ALLOWED_STATUSES)
  status_id?: UserStatus;

  toDomain(
    userId: string,
    actorSystemRole: SystemRole,
    actorUserId: string,
  ): UpdateUserDto {
    const payload: UpdateUserDto['payload'] = {};

    if (this.name !== undefined) {
      payload.name = this.name;
    }

    if (this.lastname !== undefined) {
      payload.lastname = this.lastname;
    }

    if (this.email !== undefined) {
      payload.email = this.email;
    }

    if (this.cell_phone !== undefined) {
      payload.cellPhone = this.cell_phone
        ? {
            countryCode: this.cell_phone.country_code ?? null,
            number: this.cell_phone.number ?? null,
          }
        : null;
    }

    if (this.role_id !== undefined) {
      payload.role = this.role_id;
      payload.systemRole = User.resolveSystemRoleFromLegacyRole(this.role_id);
      payload.roleId = null;
    }

    if (this.status_id !== undefined) {
      payload.status = this.status_id;
    }

    return {
      userId,
      actorSystemRole,
      actorUserId,
      payload,
    };
  }
}
