import { Type } from 'class-transformer';
import {
  IsEmail,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { SystemRole } from '@domain/entities';
import { UserPasswordPolicy } from '@domain/policies';
import { CreateUserDto } from '@application/dto';
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

  @IsOptional()
  @Type(() => PhoneRequestDto)
  @ValidateNested()
  cell_phone?: PhoneRequestDto;

  @IsNotEmpty()
  @MinLength(UserPasswordPolicy.MIN_PASSWORD_LENGTH)
  password!: string;

  @IsNotEmpty()
  @IsIn([SystemRole.ADMIN, SystemRole.USER])
  system_role!: SystemRole;

  @ValidateIf((o: CreateUserRequestDto) => o.system_role === SystemRole.USER)
  @IsNotEmpty()
  @IsString()
  role_id!: string;

  @ValidateIf(
    (o: CreateUserRequestDto) =>
      o.system_role === SystemRole.USER || o.is_internal_staff !== undefined,
  )
  @IsBoolean()
  is_internal_staff?: boolean;

  toDomain(): CreateUserDto {
    return {
      name: this.name,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      systemRole: this.system_role,
      roleId: this.system_role === SystemRole.USER ? this.role_id : null,
      isInternalStaff: this.is_internal_staff,
      cellPhone: {
        countryCode: this.cell_phone?.country_code || null,
        number: this.cell_phone?.number || null,
      },
    };
  }
}
