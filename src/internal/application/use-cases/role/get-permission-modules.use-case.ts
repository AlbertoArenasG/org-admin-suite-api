import { Inject, Injectable } from '@nestjs/common';

import { GetPermissionModulesResultDto } from '@application/dto';
import {
  IPermissionModuleReadRepository,
  IPermissionModuleReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetPermissionModulesUseCase {
  constructor(
    @Inject(IPermissionModuleReadRepositoryToken)
    private readonly permissionModuleReadRepository: IPermissionModuleReadRepository,
  ) {}

  async execute(): Promise<GetPermissionModulesResultDto> {
    const { data } = await this.permissionModuleReadRepository.findAllActive();

    return data.map((module) => ({
      id: module.id,
      code: module.code,
      name: module.name,
      status: module.status,
      isSystem: module.isSystem,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    }));
  }
}
