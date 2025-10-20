import { CreateMasterUserDto } from '@application/dto';

export class CreateMasterUserCommand {
  constructor(public readonly payload: CreateMasterUserDto) {}

  static create(payload: CreateMasterUserDto): CreateMasterUserCommand {
    return new CreateMasterUserCommand(payload);
  }
}
