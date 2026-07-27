import { Inject, Injectable } from '@nestjs/common';

import {
  GetMyPermissionsDto,
  GetMyPermissionsResultDto,
} from '@application/dto';
import { AuthorizationService } from '@application/services';
import {
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { UserStatus } from '@domain/entities';

@Injectable()
export class GetMyPermissionsUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    input: GetMyPermissionsDto,
  ): Promise<GetMyPermissionsResultDto> {
    const { data: user } = await this.userReadRepository.findById(input.userId);

    if (!user || user.status === UserStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId: input.userId,
      });
    }

    return this.authorizationService.resolveEffectivePermissions({
      userId: user.id,
      systemRole: user.systemRole,
      roleId: user.roleId ?? input.roleId ?? null,
    });
  }
}
