import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserWriteRepository,
  IUserWriteRepositoryToken,
} from '@domain/ports/repositories';
import { CreateUserDto, CreateUserResultDto } from '@application/dto';
import { User, UserStatus } from '@domain/entities';
import { UserPasswordPolicy } from '@domain/policies';
import { UserNotifierService } from '@application/services';

@Injectable()
export class CreateUserAndNotifyUseCase {
  constructor(
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepo: IUserWriteRepository,
    private readonly notifier: UserNotifierService,
  ) {}

  async execute(input: CreateUserDto): Promise<CreateUserResultDto> {
    UserPasswordPolicy.ensureSecure(input.password);

    const user = new User({
      ...input,
      password: await this.hashPassword(input.password),
      status: UserStatus.ACTIVE,
    });

    const { data: persisted } = await this.userWriteRepo.create(user);
    if (!persisted) throw new Error('USER_NOT_CREATED');

    await this.notifier.welcome(persisted);
    persisted.markAsCreated();

    return {
      id: persisted.id,
      name: persisted.name,
      lastname: persisted.lastname,
      email: persisted.email,
      role: persisted.role,
      status: persisted.status,
      createdAt: persisted.createdAt ?? new Date(),
    };
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
