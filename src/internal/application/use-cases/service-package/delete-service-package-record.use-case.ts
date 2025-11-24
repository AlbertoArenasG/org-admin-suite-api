import { Inject, Injectable } from '@nestjs/common';

import {
  DeleteServicePackageRecordDto,
  ServicePackageRecordViewDto,
} from '@application/dto';
import { ServicePackageRecordMapper } from '@application/mappers';
import {
  IServicePackageRecordReadRepository,
  IServicePackageRecordReadRepositoryToken,
  IServicePackageRecordWriteRepository,
  IServicePackageRecordWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';

@Injectable()
export class DeleteServicePackageRecordUseCase {
  constructor(
    @Inject(IServicePackageRecordReadRepositoryToken)
    private readonly readRepository: IServicePackageRecordReadRepository,
    @Inject(IServicePackageRecordWriteRepositoryToken)
    private readonly writeRepository: IServicePackageRecordWriteRepository,
  ) {}

  async execute(
    input: DeleteServicePackageRecordDto,
  ): Promise<ServicePackageRecordViewDto> {
    const { data } = await this.readRepository.findById(input.recordId);

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_PACKAGE_RECORD,
      );
    }

    data.markAsDeleted();
    const { data: updated } = await this.writeRepository.update(data);

    return ServicePackageRecordMapper.toViewDto(updated ?? data);
  }
}
