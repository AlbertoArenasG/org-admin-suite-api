import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserWriteRepository,
  IUserWriteRepositoryToken,
} from '@domain/ports/repositories';
import { User, UserStatus, NotificationType } from '@domain/entities';
import { UserPasswordPolicy } from '@domain/policies';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { CreateUserDto, CreateUserResultDto } from '@application/dto';
import { UserNotifierService } from '@application/services';

@Injectable()
export class CreateUserAndNotifyUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepo: IUserReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepo: IUserWriteRepository,
    private readonly notifier: UserNotifierService,
  ) {}

  async execute(input: CreateUserDto): Promise<CreateUserResultDto> {
    UserPasswordPolicy.ensureSecure(input.password);

    await this.ensureUserUnique(input.email);

    const user = new User({
      ...input,
      password: await this.hashPassword(input.password),
      status: UserStatus.ACTIVE,
    });

    const { data: persisted } = await this.userWriteRepo.create(user);
    if (!persisted) throw new Error('USER_NOT_CREATED');

    await this.notifier.notify(persisted, NotificationType.WELCOME_USER);
    persisted.markAsCreated();

    return {
      id: persisted.id,
      name: persisted.name,
      lastname: persisted.lastname,
      email: persisted.email,
      role: persisted.role,
      status: persisted.status,
      cellPhone: persisted.cellPhone,
      createdAt: persisted.createdAt ?? new Date(),
    };
  }

  private async ensureUserUnique(email: string): Promise<User | null> {
    const { data } = await this.userReadRepo.findByEmail(email);

    if (data)
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.USER_EMAIL,
        { email },
      );
    return data;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
