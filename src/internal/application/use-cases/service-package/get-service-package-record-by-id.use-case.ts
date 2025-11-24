import { Inject, Injectable } from '@nestjs/common';

import { ServicePackageRecordMapper } from '@application/mappers';
import { ServicePackageRecordViewDto } from '@application/dto';
import {
  IServicePackageRecordReadRepository,
  IServicePackageRecordReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';

@Injectable()
export class GetServicePackageRecordByIdUseCase {
  constructor(
    @Inject(IServicePackageRecordReadRepositoryToken)
    private readonly readRepository: IServicePackageRecordReadRepository,
  ) {}

  async execute(recordId: string): Promise<ServicePackageRecordViewDto> {
    const { data } = await this.readRepository.findById(recordId);

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_PACKAGE_RECORD,
      );
    }

    return ServicePackageRecordMapper.toViewDto(data);
  }
}
