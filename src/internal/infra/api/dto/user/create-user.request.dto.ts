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
import { UserRole } from '@domain/entities';
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

  @IsOptional()
  @Type(() => PhoneRequestDto)
  @ValidateNested()
  cell_phone?: PhoneRequestDto;

  @IsNotEmpty()
  @MinLength(2)
  password!: string;

  @IsNotEmpty()
  @IsIn(Object.values(UserRole))
  role_id!: UserRole;

  toDomain(): CreateUserDto {
    return {
      name: this.name,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      role: this.role_id,
      cellPhone: {
        countryCode: this.cell_phone?.country_code || null,
        number: this.cell_phone?.number || null,
      },
    };
  }
}
