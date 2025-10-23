import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { UpdateMyProfileDto, UpdateMyProfileResultDto } from '@application/dto';
import { UpdateMyProfileUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateMyProfileCommandAdapter implements ICommand {
  private constructor(public readonly payload: UpdateMyProfileDto) {}

  static create(payload: UpdateMyProfileDto) {
    return new UpdateMyProfileCommandAdapter(payload);
  }
}

@CommandHandler(UpdateMyProfileCommandAdapter)
export class UpdateMyProfileHandler extends BaseCommandHandler<
  UpdateMyProfileCommandAdapter,
  UpdateMyProfileResultDto
> {
  constructor(private readonly useCase: UpdateMyProfileUseCase) {
    super();
  }

  async execute(
    command: UpdateMyProfileCommandAdapter,
  ): Promise<UpdateMyProfileResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
