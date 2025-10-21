import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import {
  AuthenticateUserDto,
  AuthenticateUserResultDto,
} from '@application/dto';
import { AuthenticateUserUseCase } from '@application/use-cases';

export class AuthenticateUserCommandAdapter implements ICommand {
  private constructor(public readonly payload: AuthenticateUserDto) {}

  static create(payload: AuthenticateUserDto) {
    return new AuthenticateUserCommandAdapter(payload);
  }
}

@CommandHandler(AuthenticateUserCommandAdapter)
export class AuthenticateUserHandler
  implements ICommandHandler<AuthenticateUserCommandAdapter>
{
  constructor(private readonly useCase: AuthenticateUserUseCase) {}

  async execute(
    adapter: AuthenticateUserCommandAdapter,
  ): Promise<AuthenticateUserResultDto> {
    return this.useCase.execute(adapter.payload);
  }
}
