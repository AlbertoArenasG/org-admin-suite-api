import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { AuthenticateUserCommand } from '@application/commands';
import {
  AuthenticateUserDto,
  AuthenticateUserResultDto,
} from '@application/dto';
import { AuthenticateUserUseCase } from '@application/use-cases';

export class AuthenticateUserCmd
  extends AuthenticateUserCommand
  implements ICommand
{
  constructor(public readonly payload: AuthenticateUserDto) {
    super(payload);
  }

  static create(payload: AuthenticateUserDto): AuthenticateUserCmd {
    return new AuthenticateUserCmd(payload);
  }
}

@CommandHandler(AuthenticateUserCmd)
export class AuthenticateUserHandler
  implements ICommandHandler<AuthenticateUserCmd>
{
  constructor(private readonly useCase: AuthenticateUserUseCase) {}

  async execute(
    command: AuthenticateUserCmd,
  ): Promise<AuthenticateUserResultDto> {
    return this.useCase.execute(command.payload);
  }
}
