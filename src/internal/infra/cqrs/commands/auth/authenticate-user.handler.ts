import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  AuthenticateUserDto,
  AuthenticateUserResultDto,
} from '@application/dto';
import { AuthenticateUserUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class AuthenticateUserCommandAdapter implements ICommand {
  private constructor(public readonly payload: AuthenticateUserDto) {}

  static create(payload: AuthenticateUserDto) {
    return new AuthenticateUserCommandAdapter(payload);
  }
}

@CommandHandler(AuthenticateUserCommandAdapter)
export class AuthenticateUserHandler extends BaseCommandHandler<
  AuthenticateUserCommandAdapter,
  AuthenticateUserResultDto
> {
  constructor(private readonly useCase: AuthenticateUserUseCase) {
    super();
  }

  async execute(
    adapter: AuthenticateUserCommandAdapter,
  ): Promise<AuthenticateUserResultDto> {
    return this.run(adapter, () => this.useCase.execute(adapter.payload));
  }
}
