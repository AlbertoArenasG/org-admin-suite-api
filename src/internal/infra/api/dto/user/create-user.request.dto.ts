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

import { User, UserRole } from '@domain/entities';
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
  @IsIn([UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER])
  role_id!: UserRole;

  toDomain(): CreateUserDto {
    return {
      name: this.name,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      role: this.role_id,
      systemRole: User.resolveSystemRoleFromLegacyRole(this.role_id),
      roleId:
        this.role_id === UserRole.ADMIN
          ? null
          : this.role_id === UserRole.STAFF
            ? null
            : null,
      cellPhone: {
        countryCode: this.cell_phone?.country_code || null,
        number: this.cell_phone?.number || null,
      },
    };
  }
}
