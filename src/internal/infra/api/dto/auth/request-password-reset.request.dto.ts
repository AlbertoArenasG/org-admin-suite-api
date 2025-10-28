import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

import { RequestPasswordResetDto } from '@application/dto';

export class RequestPasswordResetRequestDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email!: string;

  toDomain(): RequestPasswordResetDto {
    return {
      email: this.email,
    };
  }
}
