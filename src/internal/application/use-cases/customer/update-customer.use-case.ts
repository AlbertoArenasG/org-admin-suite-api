import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateCustomerDto,
  CustomerFiscalProfileViewDto,
} from '@application/dto';
import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  ICustomerWriteRepository,
  ICustomerWriteRepositoryToken,
  ICustomerFiscalProfileReadRepository,
  ICustomerFiscalProfileReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { CustomerFiscalProfileMapper } from '@application/mappers';
import { buildFilesMetadataForProfile } from '@application/utils';
import { CustomerStatus } from '@domain/entities';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
    @Inject(ICustomerWriteRepositoryToken)
    private readonly customerWriteRepository: ICustomerWriteRepository,
    @Inject(ICustomerFiscalProfileReadRepositoryToken)
    private readonly profileReadRepository: ICustomerFiscalProfileReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
  ) {}

  async execute(
    input: UpdateCustomerDto,
  ): Promise<CustomerFiscalProfileViewDto> {
    const { data: customer } = await this.customerReadRepository.findById(
      input.customerId,
    );

    if (!customer || customer.status === CustomerStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER,
        { id: input.customerId },
      );
    }

    if (input.clientCode && input.clientCode !== customer.clientCode) {
      const { data: existing } =
        await this.customerReadRepository.findByClientCode(input.clientCode);

      if (existing && existing.id !== customer.id) {
        throw EntityAlreadyExistsException.create(
          EntityAlreadyExistsExceptionCode.CUSTOMER_FISCAL_PROFILE_CODE,
          { clientCode: input.clientCode },
        );
      }
    }

    customer.updateDetails({
      companyName: input.companyName,
      clientCode: input.clientCode,
    });

    await this.customerWriteRepository.update(customer);

    const { data: profile } = await this.profileReadRepository.findByCustomerId(
      customer.id,
    );

    const filesMetadata = profile
      ? await buildFilesMetadataForProfile({
          profile,
          fileReadRepository: this.fileReadRepository,
        })
      : undefined;

    return CustomerFiscalProfileMapper.toViewDto(
      customer,
      profile ?? null,
      filesMetadata,
    );
  }
}
