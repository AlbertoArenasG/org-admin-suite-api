import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { SystemRole, UserStatus } from '@domain/entities';
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
  @IsIn(Object.values(SystemRole))
  system_role?: SystemRole;

  @ValidateIf((o: UpdateUserRequestDto) => o.system_role === SystemRole.USER)
  @IsOptional()
  @IsString()
  role_id?: string;

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

    if (this.system_role !== undefined) {
      payload.systemRole = this.system_role;
    }

    if (this.role_id !== undefined) {
      payload.roleId = this.role_id;
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
