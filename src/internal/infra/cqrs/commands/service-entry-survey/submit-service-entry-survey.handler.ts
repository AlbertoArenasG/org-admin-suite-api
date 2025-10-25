import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  SubmitServiceEntrySurveyDto,
  ServiceEntrySurveyViewDto,
} from '@application/dto';
import { SubmitServiceEntrySurveyUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class SubmitServiceEntrySurveyCommandAdapter implements ICommand {
  private constructor(public readonly payload: SubmitServiceEntrySurveyDto) {}

  static create(payload: SubmitServiceEntrySurveyDto) {
    return new SubmitServiceEntrySurveyCommandAdapter(payload);
  }
}

@CommandHandler(SubmitServiceEntrySurveyCommandAdapter)
export class SubmitServiceEntrySurveyHandler extends BaseCommandHandler<
  SubmitServiceEntrySurveyCommandAdapter,
  ServiceEntrySurveyViewDto
> {
  constructor(private readonly useCase: SubmitServiceEntrySurveyUseCase) {
    super();
  }

  async execute(
    command: SubmitServiceEntrySurveyCommandAdapter,
  ): Promise<ServiceEntrySurveyViewDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
