import { Inject, Injectable } from '@nestjs/common';

import {
  GetServicePackageRecordsDto,
  GetServicePackageRecordsResultDto,
} from '@application/dto';
import { ServicePackageRecordMapper } from '@application/mappers';
import {
  IServicePackageRecordReadRepository,
  IServicePackageRecordReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetServicePackageRecordsUseCase {
  constructor(
    @Inject(IServicePackageRecordReadRepositoryToken)
    private readonly readRepository: IServicePackageRecordReadRepository,
  ) {}

  async execute(
    input: GetServicePackageRecordsDto,
  ): Promise<GetServicePackageRecordsResultDto> {
    const { data, total } = await this.readRepository.findAll({
      page: input.page,
      perPage: input.perPage,
      packageId: input.packageId ?? null,
      search: input.search ?? null,
    });

    return {
      items: data.map((record) => ServicePackageRecordMapper.toViewDto(record)),
      page: input.page,
      perPage: input.perPage,
      total,
    };
  }
}
