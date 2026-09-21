import { CommandHandler, ICommand } from '@nestjs/cqrs';
import {
  CreateCustomerServiceRecordDto,
  CreateCustomerServiceRecordResultDto,
  DeleteCustomerServiceRecordDto,
  UpdateCustomerServiceRecordAssetDto,
  UpdateCustomerServiceRecordAssetResultDto,
  UpdateCustomerServiceRecordCustomerDto,
  UpdateCustomerServiceRecordCustomerResultDto,
  UpdateCustomerServiceRecordDetailsDto,
  UpdateCustomerServiceRecordDetailsResultDto,
  UpdateCustomerServiceRecordDocumentDto,
  UpdateCustomerServiceRecordDocumentResultDto,
  UpdateCustomerServiceRecordProviderDto,
  UpdateCustomerServiceRecordProviderResultDto,
} from '@application/dto';
import {
  CreateCustomerServiceRecordUseCase,
  DeleteCustomerServiceRecordUseCase,
  UpdateCustomerServiceRecordAssetUseCase,
  UpdateCustomerServiceRecordCustomerUseCase,
  UpdateCustomerServiceRecordDetailsUseCase,
  UpdateCustomerServiceRecordDocumentUseCase,
  UpdateCustomerServiceRecordProviderUseCase,
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
export class UpdateCustomerServiceRecordDetailsCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateCustomerServiceRecordDetailsDto,
  ) {}
  static create(payload: UpdateCustomerServiceRecordDetailsDto) {
    return new UpdateCustomerServiceRecordDetailsCommandAdapter(payload);
  }
}
@CommandHandler(UpdateCustomerServiceRecordDetailsCommandAdapter)
export class UpdateCustomerServiceRecordDetailsHandler extends BaseCommandHandler<
  UpdateCustomerServiceRecordDetailsCommandAdapter,
  UpdateCustomerServiceRecordDetailsResultDto
> {
  constructor(
    private readonly useCase: UpdateCustomerServiceRecordDetailsUseCase,
  ) {
    super();
  }
  async execute(command: UpdateCustomerServiceRecordDetailsCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
export class UpdateCustomerServiceRecordCustomerCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateCustomerServiceRecordCustomerDto,
  ) {}
  static create(payload: UpdateCustomerServiceRecordCustomerDto) {
    return new UpdateCustomerServiceRecordCustomerCommandAdapter(payload);
  }
}
@CommandHandler(UpdateCustomerServiceRecordCustomerCommandAdapter)
export class UpdateCustomerServiceRecordCustomerHandler extends BaseCommandHandler<
  UpdateCustomerServiceRecordCustomerCommandAdapter,
  UpdateCustomerServiceRecordCustomerResultDto
> {
  constructor(
    private readonly useCase: UpdateCustomerServiceRecordCustomerUseCase,
  ) {
    super();
  }
  async execute(command: UpdateCustomerServiceRecordCustomerCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
export class UpdateCustomerServiceRecordProviderCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateCustomerServiceRecordProviderDto,
  ) {}
  static create(payload: UpdateCustomerServiceRecordProviderDto) {
    return new UpdateCustomerServiceRecordProviderCommandAdapter(payload);
  }
}
@CommandHandler(UpdateCustomerServiceRecordProviderCommandAdapter)
export class UpdateCustomerServiceRecordProviderHandler extends BaseCommandHandler<
  UpdateCustomerServiceRecordProviderCommandAdapter,
  UpdateCustomerServiceRecordProviderResultDto
> {
  constructor(
    private readonly useCase: UpdateCustomerServiceRecordProviderUseCase,
  ) {
    super();
  }
  async execute(command: UpdateCustomerServiceRecordProviderCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
export class UpdateCustomerServiceRecordAssetCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateCustomerServiceRecordAssetDto,
  ) {}
  static create(payload: UpdateCustomerServiceRecordAssetDto) {
    return new UpdateCustomerServiceRecordAssetCommandAdapter(payload);
  }
}
@CommandHandler(UpdateCustomerServiceRecordAssetCommandAdapter)
export class UpdateCustomerServiceRecordAssetHandler extends BaseCommandHandler<
  UpdateCustomerServiceRecordAssetCommandAdapter,
  UpdateCustomerServiceRecordAssetResultDto
> {
  constructor(
    private readonly useCase: UpdateCustomerServiceRecordAssetUseCase,
  ) {
    super();
  }
  async execute(command: UpdateCustomerServiceRecordAssetCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
export class UpdateCustomerServiceRecordDocumentCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateCustomerServiceRecordDocumentDto,
  ) {}
  static create(payload: UpdateCustomerServiceRecordDocumentDto) {
    return new UpdateCustomerServiceRecordDocumentCommandAdapter(payload);
  }
}
@CommandHandler(UpdateCustomerServiceRecordDocumentCommandAdapter)
export class UpdateCustomerServiceRecordDocumentHandler extends BaseCommandHandler<
  UpdateCustomerServiceRecordDocumentCommandAdapter,
  UpdateCustomerServiceRecordDocumentResultDto
> {
  constructor(
    private readonly useCase: UpdateCustomerServiceRecordDocumentUseCase,
  ) {
    super();
  }
  async execute(command: UpdateCustomerServiceRecordDocumentCommandAdapter) {
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
