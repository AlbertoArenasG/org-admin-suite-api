import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { SystemRole } from '@domain/entities';
import { CreateApplicationUserRegistrationInvitationDto } from '@application/dto';
import {
  UserRegistrationInvitationScope,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';
import { PhoneRequestDto } from '@infra/api/dto/shared';

export class CreateUserRegistrationInvitationRequestDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @Type(() => PhoneRequestDto)
  @ValidateNested()
  cell_phone?: PhoneRequestDto;

  @IsNotEmpty()
  @IsIn([SystemRole.ADMIN, SystemRole.USER])
  system_role!: SystemRole;

  @IsString()
  @IsNotEmpty()
  role_id!: string;

  @ValidateIf(
    (o: CreateUserRegistrationInvitationRequestDto) =>
      o.system_role === SystemRole.USER || o.is_internal_staff !== undefined,
  )
  @IsBoolean()
  is_internal_staff?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  customer_ids?: string[];

  toDomain(
    invitedByUserId: string,
  ): CreateApplicationUserRegistrationInvitationDto {
    return {
      scope: UserRegistrationInvitationScope.APPLICATION,
      email: this.email,
      systemRole: this.system_role,
      roleId: this.role_id,
      isInternalStaff: this.is_internal_staff as boolean,
      invitedByUserId,
      userData: this.buildUserData(),
      customerIds: this.customer_ids ?? [],
    };
  }

  private buildUserData(): UserRegistrationInvitationUserData | null {
    const hasAnyField =
      Boolean(this.name) || Boolean(this.lastname) || Boolean(this.cell_phone);

    if (!hasAnyField) {
      return null;
    }

    return {
      name: this.name ?? null,
      lastname: this.lastname ?? null,
      cellPhone: this.cell_phone
        ? {
            countryCode: this.cell_phone.country_code ?? null,
            number: this.cell_phone.number ?? null,
          }
        : null,
    };
  }
}
