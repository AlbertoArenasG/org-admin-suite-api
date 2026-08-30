import { CommandHandler, ICommand } from '@nestjs/cqrs';
import {
  CreateCustomerServiceRecordDto,
  CreateCustomerServiceRecordResultDto,
  DeleteCustomerServiceRecordDto,
  UpdateCustomerServiceRecordDto,
  UpdateCustomerServiceRecordResultDto,
} from '@application/dto';
import {
  CreateCustomerServiceRecordUseCase,
  DeleteCustomerServiceRecordUseCase,
  UpdateCustomerServiceRecordUseCase,
} from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';
export class CreateCustomerServiceRecordCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: CreateCustomerServiceRecordDto,
  ) {}
  static create(payload: CreateCustomerServiceRecordDto) {
    return new CreateCustomerServiceRecordCommandAdapter(payload);
  }
}
@CommandHandler(CreateCustomerServiceRecordCommandAdapter)
export class CreateCustomerServiceRecordHandler extends BaseCommandHandler<
  CreateCustomerServiceRecordCommandAdapter,
  CreateCustomerServiceRecordResultDto
> {
  constructor(private readonly useCase: CreateCustomerServiceRecordUseCase) {
    super();
  }
  async execute(command: CreateCustomerServiceRecordCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
export class UpdateCustomerServiceRecordCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: UpdateCustomerServiceRecordDto,
  ) {}
  static create(payload: UpdateCustomerServiceRecordDto) {
    return new UpdateCustomerServiceRecordCommandAdapter(payload);
  }
}
@CommandHandler(UpdateCustomerServiceRecordCommandAdapter)
export class UpdateCustomerServiceRecordHandler extends BaseCommandHandler<
  UpdateCustomerServiceRecordCommandAdapter,
  UpdateCustomerServiceRecordResultDto
> {
  constructor(private readonly useCase: UpdateCustomerServiceRecordUseCase) {
    super();
  }
  async execute(command: UpdateCustomerServiceRecordCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
export class DeleteCustomerServiceRecordCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: DeleteCustomerServiceRecordDto,
  ) {}
  static create(payload: DeleteCustomerServiceRecordDto) {
    return new DeleteCustomerServiceRecordCommandAdapter(payload);
  }
}
@CommandHandler(DeleteCustomerServiceRecordCommandAdapter)
export class DeleteCustomerServiceRecordHandler extends BaseCommandHandler<
  DeleteCustomerServiceRecordCommandAdapter,
  void
> {
  constructor(private readonly useCase: DeleteCustomerServiceRecordUseCase) {
    super();
  }
  async execute(command: DeleteCustomerServiceRecordCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
