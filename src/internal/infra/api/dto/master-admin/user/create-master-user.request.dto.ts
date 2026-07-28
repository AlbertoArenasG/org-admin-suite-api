import { Type } from 'class-transformer';
import {
  IsEmail,
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
import { CreateMasterUserDto } from '@application/dto';
import { PhoneRequestDto } from '@infra/api/dto/shared';

export class CreateMasterUserRequestDto {
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
  @IsIn(Object.values(SystemRole))
  system_role!: SystemRole;

  @ValidateIf(
    (o: CreateMasterUserRequestDto) => o.system_role === SystemRole.USER,
  )
  @IsNotEmpty()
  @IsString()
  role_id!: string;

  toDomain(): CreateMasterUserDto {
    return {
      name: this.name,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      systemRole: this.system_role,
      roleId: this.system_role === SystemRole.USER ? this.role_id : null,
      cellPhone: {
        countryCode: this.cell_phone?.country_code || null,
        number: this.cell_phone?.number || null,
      },
    };
  }
}
