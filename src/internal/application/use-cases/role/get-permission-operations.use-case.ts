import { Inject, Injectable } from '@nestjs/common';

import { GetPermissionOperationsResultDto } from '@application/dto';
import {
  IPermissionOperationReadRepository,
  IPermissionOperationReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetPermissionOperationsUseCase {
  constructor(
    @Inject(IPermissionOperationReadRepositoryToken)
    private readonly permissionOperationReadRepository: IPermissionOperationReadRepository,
  ) {}

  async execute(): Promise<GetPermissionOperationsResultDto> {
    const { data } =
      await this.permissionOperationReadRepository.findAllActive();

    return data.map((operation) => ({
      id: operation.id,
      code: operation.code,
      name: operation.name,
      status: operation.status,
      isSystem: operation.isSystem,
      createdAt: operation.createdAt,
      updatedAt: operation.updatedAt,
    }));
  }
}
