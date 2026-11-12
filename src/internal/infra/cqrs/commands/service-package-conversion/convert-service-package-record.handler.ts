import { CommandHandler, ICommand } from '@nestjs/cqrs';
import {
  ConvertServicePackageRecordDto,
  ConvertServicePackageRecordResultDto,
} from '@application/dto';
import { ConvertServicePackageRecordUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class ConvertServicePackageRecordCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: ConvertServicePackageRecordDto,
  ) {}
  static create(payload: ConvertServicePackageRecordDto) {
    return new ConvertServicePackageRecordCommandAdapter(payload);
  }
}

@CommandHandler(ConvertServicePackageRecordCommandAdapter)
export class ConvertServicePackageRecordHandler extends BaseCommandHandler<
  ConvertServicePackageRecordCommandAdapter,
  ConvertServicePackageRecordResultDto
> {
  constructor(private readonly useCase: ConvertServicePackageRecordUseCase) {
    super();
  }
  async execute(command: ConvertServicePackageRecordCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
