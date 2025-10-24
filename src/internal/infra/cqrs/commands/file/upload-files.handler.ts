import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { UploadFilesDto, UploadFilesResultDto } from '@application/dto';
import { UploadFilesUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UploadFilesCommandAdapter implements ICommand {
  private constructor(public readonly payload: UploadFilesDto) {}

  static create(payload: UploadFilesDto) {
    return new UploadFilesCommandAdapter(payload);
  }
}

@CommandHandler(UploadFilesCommandAdapter)
export class UploadFilesHandler extends BaseCommandHandler<
  UploadFilesCommandAdapter,
  UploadFilesResultDto
> {
  constructor(private readonly useCase: UploadFilesUseCase) {
    super();
  }

  async execute(
    command: UploadFilesCommandAdapter,
  ): Promise<UploadFilesResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
