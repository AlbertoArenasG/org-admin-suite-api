import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

import { AuthenticateUserDto } from '@application/dto';
import { UserPasswordPolicy } from '@domain/policies';

export class LoginRequestDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(UserPasswordPolicy.MIN_PASSWORD_LENGTH)
  password!: string;

  toDomain(): AuthenticateUserDto {
    return {
      email: this.email,
      password: this.password,
    };
  }
}
