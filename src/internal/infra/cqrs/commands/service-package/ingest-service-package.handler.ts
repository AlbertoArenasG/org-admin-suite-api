import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  IngestServicePackageDto,
  IngestServicePackageResultDto,
} from '@application/dto';
import { IngestServicePackageUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class IngestServicePackageCommandAdapter implements ICommand {
  private constructor(public readonly payload: IngestServicePackageDto) {}

  static create(payload: IngestServicePackageDto) {
    return new IngestServicePackageCommandAdapter(payload);
  }
}

@CommandHandler(IngestServicePackageCommandAdapter)
export class IngestServicePackageHandler extends BaseCommandHandler<
  IngestServicePackageCommandAdapter,
  IngestServicePackageResultDto
> {
  constructor(private readonly useCase: IngestServicePackageUseCase) {
    super();
  }

  async execute(
    command: IngestServicePackageCommandAdapter,
  ): Promise<IngestServicePackageResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
