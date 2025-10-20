import { AuthenticateUserDto } from '@application/dto';

export class AuthenticateUserCommand {
  constructor(public readonly payload: AuthenticateUserDto) {}

  static create(payload: AuthenticateUserDto): AuthenticateUserCommand {
    return new AuthenticateUserCommand(payload);
  }
}
