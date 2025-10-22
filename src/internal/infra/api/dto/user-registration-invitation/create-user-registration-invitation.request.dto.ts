import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { UserRole } from '@domain/entities';
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
  @IsIn(Object.values(UserRole))
  role_id!: UserRole;

  toDomain(
    invitedByUserId: string,
  ): CreateApplicationUserRegistrationInvitationDto {
    return {
      scope: UserRegistrationInvitationScope.APPLICATION,
      email: this.email,
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
