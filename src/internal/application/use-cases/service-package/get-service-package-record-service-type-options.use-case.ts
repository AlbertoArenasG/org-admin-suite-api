import { Inject, Injectable } from '@nestjs/common';

import { GetServicePackageRecordServiceTypeOptionsResultDto } from '@application/dto';
import {
  IServicePackageRecordReadRepository,
  IServicePackageRecordReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetServicePackageRecordServiceTypeOptionsUseCase {
  constructor(
    @Inject(IServicePackageRecordReadRepositoryToken)
    private readonly readRepository: IServicePackageRecordReadRepository,
  ) {}

  async execute(): Promise<GetServicePackageRecordServiceTypeOptionsResultDto> {
    const { data } = await this.readRepository.findServiceTypes();

    return data.map((serviceType) => ({
      value: serviceType,
      label: serviceType,
    }));
  }
}
