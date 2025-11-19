import { Inject, Injectable } from '@nestjs/common';

import { CustomerFiscalProfileViewDto } from '@application/dto';
import {
  ICustomerFiscalProfileReadRepository,
  ICustomerFiscalProfileReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { CustomerFiscalProfileMapper } from '@application/mappers';
import { buildFilesMetadataForProfile } from '@application/utils';
import { CustomerStatus } from '@domain/entities';

@Injectable()
export class GetCustomerFiscalProfileByIdUseCase {
  constructor(
    @Inject(ICustomerFiscalProfileReadRepositoryToken)
    private readonly profileReadRepository: ICustomerFiscalProfileReadRepository,
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
  ) {}

  async execute(customerId: string): Promise<CustomerFiscalProfileViewDto> {
    const { data: customer } =
      await this.customerReadRepository.findById(customerId);

    if (!customer || customer.status === CustomerStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER,
        { id: customerId },
      );
    }

    const { data: profile } = await this.profileReadRepository.findByCustomerId(
      customer.id,
    );

    if (!profile) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_FISCAL_PROFILE,
        { customerId },
      );
    }

    const filesMetadata = await buildFilesMetadataForProfile({
      profile,
      fileReadRepository: this.fileReadRepository,
    });

    return CustomerFiscalProfileMapper.toViewDto(
      customer,
      profile,
      filesMetadata,
    );
  }
}
