import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { TenantUserRole } from '@domain/entities';
import { CreateTenantUserRegistrationInvitationDto } from '@application/dto';
import {
  UserRegistrationInvitationScope,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';
import { PhoneRequestDto } from '@infra/api/dto/shared';

export class CreateTenantUserRegistrationInvitationRequestDto {
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
  @IsIn(Object.values(TenantUserRole))
  role_id!: TenantUserRole;

  toDomain(
    tenantId: string,
    invitedByUserId: string,
  ): CreateTenantUserRegistrationInvitationDto {
    return {
      scope: UserRegistrationInvitationScope.TENANT,
      email: this.email,
      tenantId,
      role: this.role_id,
      invitedByUserId,
      userData: this.buildUserData(),
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
