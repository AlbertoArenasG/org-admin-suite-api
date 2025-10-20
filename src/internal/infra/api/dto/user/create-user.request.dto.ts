import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { TenantUserRole } from '@domain/entities';
import { UserPasswordPolicy } from '@domain/policies';
import { CreateUserDto } from '@src/internal/application/dto';
import { PhoneRequestDto } from '@infra/api/dto/shared';

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  lastname!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  tenant_id!: string;

  @IsOptional()
  @Type(() => PhoneRequestDto)
  @ValidateNested()
  cell_phone?: PhoneRequestDto;

  @IsNotEmpty()
  @MinLength(UserPasswordPolicy.MIN_PASSWORD_LENGTH)
  password!: string;

  @IsNotEmpty()
  @IsIn(Object.values(TenantUserRole))
  role_id!: TenantUserRole;

  toDomain(): CreateUserDto {
    return {
      name: this.name,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      tenantId: this.tenant_id,
      role: this.role_id,
      cellPhone: {
        countryCode: this.cell_phone?.country_code || null,
        number: this.cell_phone?.number || null,
      },
    };
  }
}
