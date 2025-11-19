import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { CompleteNewUserRegistrationInvitationDto } from '@application/dto';
import { UserPasswordPolicy } from '@domain/policies';
import { UserRegistrationInvitationUserData } from '@domain/ports/repositories';
import { PhoneRequestDto } from '@infra/api/dto/shared';

export class CompleteNewUserRegistrationInvitationRequestDto {
  @IsNotEmpty()
  @MinLength(UserPasswordPolicy.MIN_PASSWORD_LENGTH)
  password!: string;

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

  toDomain(token: string): CompleteNewUserRegistrationInvitationDto {
    return {
      token,
      password: this.password,
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
