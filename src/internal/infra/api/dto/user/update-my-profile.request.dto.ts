import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { UpdateMyProfileDto } from '@application/dto';
import { PhoneRequestDto } from '@infra/api/dto/shared';
import { UserPasswordPolicy } from '@domain/policies';

export class UpdateMyProfileRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @Type(() => PhoneRequestDto)
  @ValidateNested()
  cell_phone?: PhoneRequestDto | null;

  @IsOptional()
  @MinLength(UserPasswordPolicy.MIN_PASSWORD_LENGTH)
  password?: string;

  toDomain(userId: string): UpdateMyProfileDto {
    const payload: UpdateMyProfileDto = {
      userId,
    };

    if (this.name !== undefined) {
      payload.name = this.name;
    }

    if (this.lastname !== undefined) {
      payload.lastname = this.lastname;
    }

    if (this.cell_phone !== undefined) {
      payload.cellPhone = this.cell_phone
        ? {
            countryCode: this.cell_phone.country_code ?? null,
            number: this.cell_phone.number ?? null,
          }
        : null;
    }

    if (this.password !== undefined) {
      payload.password = this.password;
    }

    return payload;
  }
}
