import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { ServiceEntryViewDto, UpdateServiceEntryDto } from '@application/dto';
import { UpdateServiceEntryUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateServiceEntryCommandAdapter implements ICommand {
  private constructor(public readonly payload: UpdateServiceEntryDto) {}

  static create(payload: UpdateServiceEntryDto) {
    return new UpdateServiceEntryCommandAdapter(payload);
  }
}

@CommandHandler(UpdateServiceEntryCommandAdapter)
export class UpdateServiceEntryHandler extends BaseCommandHandler<
  UpdateServiceEntryCommandAdapter,
  ServiceEntryViewDto
> {
  constructor(private readonly useCase: UpdateServiceEntryUseCase) {
    super();
  }

  async execute(
    command: UpdateServiceEntryCommandAdapter,
  ): Promise<ServiceEntryViewDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
