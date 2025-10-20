import { CreateTenantDto } from '@application/dto';

export class CreateTenantCommand {
  constructor(public readonly payload: CreateTenantDto) {}

  static create(payload: CreateTenantDto): CreateTenantCommand {
    return new CreateTenantCommand(payload);
  }
}
