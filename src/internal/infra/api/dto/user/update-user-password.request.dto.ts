import { IsNotEmpty, IsString, MinLength } from 'class-validator';

import { UpdateUserPasswordDto } from '@application/dto';
import { SystemRole } from '@domain/entities';
import { UserPasswordPolicy } from '@domain/policies';

export class UpdateUserPasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(UserPasswordPolicy.MIN_PASSWORD_LENGTH)
  password!: string;

  toDomain(
    userId: string,
    actorSystemRole: SystemRole,
    actorUserId: string,
  ): UpdateUserPasswordDto {
    return {
      userId,
      actorSystemRole,
      actorUserId,
      password: this.password,
    };
  }
}
