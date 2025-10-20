import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { TenantUserRole } from '@domain/entities';
import { UserPasswordPolicy } from '@domain/policies';
import { CreateUserDto } from '@application/dto';
import { PhoneRequestDto } from '@infra/api/dto/shared';

export class CreateTenantUserForMasterRequestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  lastname!: string;

  @IsEmail()
  email!: string;

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

  toDomain(tenantId: string): CreateUserDto {
    return {
      name: this.name,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      tenantId,
      role: this.role_id,
      cellPhone: {
        countryCode: this.cell_phone?.country_code || null,
        number: this.cell_phone?.number || null,
      },
    };
  }
}
