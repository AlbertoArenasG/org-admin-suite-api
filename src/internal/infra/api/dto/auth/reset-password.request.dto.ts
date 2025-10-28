import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

import { ResetUserPasswordDto } from '@application/dto';
import { UserPasswordPolicy } from '@domain/policies';

export class ResetPasswordRequestDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(UserPasswordPolicy.MIN_PASSWORD_LENGTH)
  password!: string;

  toDomain(): ResetUserPasswordDto {
    return {
      token: this.token,
      password: this.password,
    };
  }
}
