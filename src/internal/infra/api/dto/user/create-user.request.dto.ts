import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  MinLength,
  IsString,
} from 'class-validator';
import { UserRole } from '@domain/entities';
import { CreateUserDto } from '@src/internal/application/dto';

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
    };
  }
}
