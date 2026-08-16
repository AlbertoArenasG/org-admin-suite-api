import { Inject, Injectable } from '@nestjs/common';

import { GetExpirationStatusPolicyByIdResultDto } from '@application/dto';
import { ExpirationStatusPolicyMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IExpirationStatusPolicyReadRepository,
  IExpirationStatusPolicyReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetExpirationStatusPolicyByIdUseCase {
  constructor(
    @Inject(IExpirationStatusPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationStatusPolicyReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(
    expirationStatusPolicyId: string,
  ): Promise<GetExpirationStatusPolicyByIdResultDto> {
    const { data } = await this.readRepository.findById(
      expirationStatusPolicyId,
    );

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.EXPIRATION_STATUS_POLICY,
        { expirationStatusPolicyId },
      );
    }

    const { createdByUser, updatedByUser } =
      await this.auditUserFetcher.fetchAuditUsers({
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      });

    return ExpirationStatusPolicyMapper.toViewDto(
      data,
      createdByUser,
      updatedByUser,
    );
  }
}
