import { CreateUserDto } from '@application/dto';

export class CreateUserAndNotifyCommand {
  constructor(public readonly payload: CreateUserDto) {}

  static create(payload: CreateUserDto): CreateUserAndNotifyCommand {
    return new CreateUserAndNotifyCommand(payload);
  }
}
