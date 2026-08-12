import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserWriteRepository,
  IUserWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { UserPasswordPolicy } from '@domain/policies';
import { UpdateMyProfileDto, UpdateMyProfileResultDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import { UserStatus } from '@domain/entities';
import { SyncUserContactService } from '@application/services';

@Injectable()
export class UpdateMyProfileUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly syncUserContactService: SyncUserContactService,
  ) {}

  async execute(input: UpdateMyProfileDto): Promise<UpdateMyProfileResultDto> {
    const { userId, name, lastname, cellPhone, password } = input;

    const { data: user } = await this.userReadRepository.findById(userId);

    if (!user || user.status === UserStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    const details: {
      name?: string;
      lastname?: string;
      cellPhone?: {
        countryCode: string | null;
        number: string | null;
      } | null;
    } = {};

    if (name !== undefined) {
      details.name = name;
    }

    if (lastname !== undefined) {
      details.lastname = lastname;
    }

    if (cellPhone !== undefined) {
      details.cellPhone = cellPhone;
    }

    if (Object.keys(details).length > 0) {
      user.updateDetails(details);
    }

    if (password !== undefined) {
      UserPasswordPolicy.ensureSecure(password);
      const hashed = await this.hashPassword(password);
      user.updatePassword(hashed);
    }

    const { data: updated } = await this.userWriteRepository.update(user);

    if (!updated) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    await this.syncUserContactService.syncFromUser(updated);

    const roleName = updated.roleId
      ? ((await this.roleReadRepository.findById(updated.roleId)).data?.name ??
        null)
      : null;

    return UserResultMapper.toUserViewDto(updated, roleName);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
