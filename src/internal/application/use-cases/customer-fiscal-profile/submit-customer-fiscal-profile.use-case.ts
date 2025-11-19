import { Inject, Injectable } from '@nestjs/common';

import {
  SubmitCustomerFiscalProfileDto,
  CustomerFiscalProfileViewDto,
} from '@application/dto';
import {
  ICustomerFiscalProfileReadRepository,
  ICustomerFiscalProfileReadRepositoryToken,
  ICustomerFiscalProfileWriteRepository,
  ICustomerFiscalProfileWriteRepositoryToken,
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  Customer,
  CustomerFiscalProfile,
  CustomerStatus,
} from '@domain/entities';
import { CustomerFiscalProfileMapper } from '@application/mappers';
import { buildFilesMetadataForProfile } from '@application/utils';

@Injectable()
export class SubmitCustomerFiscalProfileUseCase {
  constructor(
    @Inject(ICustomerFiscalProfileReadRepositoryToken)
    private readonly profileReadRepository: ICustomerFiscalProfileReadRepository,
    @Inject(ICustomerFiscalProfileWriteRepositoryToken)
    private readonly profileWriteRepository: ICustomerFiscalProfileWriteRepository,
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
  ) {}

  async execute(
    input: SubmitCustomerFiscalProfileDto,
  ): Promise<CustomerFiscalProfileViewDto> {
    const { customer, profile } = await this.resolveCustomerAndProfile(
      input.token,
    );

    if (!input.taxCertificateFileId) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'tax_certificate_file_id',
      });
    }

    await this.ensureFileExists(input.taxCertificateFileId);

    if (input.invoiceRequirementsFileId) {
      await this.ensureFileExists(input.invoiceRequirementsFileId);
    }

    profile.markFormSubmitted({
      formData: input.formData,
      taxCertificateFileId: input.taxCertificateFileId,
      invoiceRequirementsFileId: input.invoiceRequirementsFileId ?? null,
    });

    const { data: updatedProfile } =
      await this.profileWriteRepository.update(profile);
    const persistedProfile: CustomerFiscalProfile = updatedProfile ?? profile;

    const filesMetadata = await buildFilesMetadataForProfile({
      profile: persistedProfile,
      fileReadRepository: this.fileReadRepository,
    });

    return CustomerFiscalProfileMapper.toViewDto(
      customer,
      persistedProfile,
      filesMetadata,
    );
  }

  private async ensureFileExists(fileId: string): Promise<void> {
    const { data } = await this.fileReadRepository.findById(fileId);
    if (!data) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
        fileId,
      });
    }
  }

  private async resolveCustomerAndProfile(token: string): Promise<{
    customer: Customer;
    profile: CustomerFiscalProfile;
  }> {
    const { data: customer } =
      await this.customerReadRepository.findByAccessToken(token);

    if (!customer || customer.status === CustomerStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER,
        { token },
      );
    }

    const { data: profile } = await this.profileReadRepository.findByCustomerId(
      customer.id,
    );

    if (!profile) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_FISCAL_PROFILE,
        { customerId: customer.id },
      );
    }

    return { customer, profile };
  }
}
