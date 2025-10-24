import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  CreateServiceEntryDto,
  CreateServiceEntryResultDto,
} from '@application/dto';
import { CreateServiceEntryUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateServiceEntryCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateServiceEntryDto) {}

  static create(payload: CreateServiceEntryDto) {
    return new CreateServiceEntryCommandAdapter(payload);
  }
}

@CommandHandler(CreateServiceEntryCommandAdapter)
export class CreateServiceEntryHandler extends BaseCommandHandler<
  CreateServiceEntryCommandAdapter,
  CreateServiceEntryResultDto
> {
  constructor(private readonly useCase: CreateServiceEntryUseCase) {
    super();
  }

  async execute(
    command: CreateServiceEntryCommandAdapter,
  ): Promise<CreateServiceEntryResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
