import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  MinLength,
  IsString,
  IsObject,
  IsOptional,
} from 'class-validator';
import { UserRole } from '@domain/entities';
import { CreateUserDto } from '@src/internal/application/dto';
import { Phone } from '@src/internal/domain/value-objects';

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
  @IsObject()
  cell_phone?: {
    country_code: string | null;
    number: string | null;
  } = {
    country_code: null,
    number: null,
  };

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
      cellPhone: new Phone({
        countryCode: this.cell_phone?.country_code,
        number: this.cell_phone?.number,
      }),
    };
  }
}
