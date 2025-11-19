import { Customer, CustomerFiscalProfile } from '@domain/entities';
import {
  CreateCustomerFiscalProfileResultDto,
  CustomerFiscalProfileViewDto,
  CustomerFiscalProfileFilesMetadataDto,
} from '@application/dto';
import { createEmptyCustomerFiscalProfileFilesMetadata } from '@application/utils';

export class CustomerFiscalProfileMapper {
  static toCreateResultDto(
    customer: Customer,
    profile: CustomerFiscalProfile,
    filesMetadata?: CustomerFiscalProfileFilesMetadataDto,
  ): CreateCustomerFiscalProfileResultDto {
    return this.toViewDto(customer, profile, filesMetadata);
  }

  static toViewDto(
    customer: Customer,
    profile: CustomerFiscalProfile | null,
    filesMetadata?: CustomerFiscalProfileFilesMetadataDto,
  ): CustomerFiscalProfileViewDto {
    const fiscalProfile = profile
      ? {
          id: profile.id,
          status: profile.status,
          formData: profile.formData,
          submittedAt: profile.submittedAt,
          taxCertificateFileId: profile.taxCertificateFileId,
          invoiceRequirementsFileId: profile.invoiceRequirementsFileId,
          filesMetadata:
            filesMetadata ?? createEmptyCustomerFiscalProfileFilesMetadata(),
        }
      : null;

    return {
      id: customer.id,
      companyName: customer.companyName,
      clientCode: customer.clientCode,
      publicAccessToken: customer.accessToken ?? null,
      status: customer.status,
      createdAt: customer.createdAt ?? new Date(),
      updatedAt: customer.updatedAt,
      fiscalProfile,
    };
  }

  static toCollection(
    entries: Array<{
      customer: Customer;
      profile: CustomerFiscalProfile | null;
      metadata?: CustomerFiscalProfileFilesMetadataDto;
    }>,
  ): CustomerFiscalProfileViewDto[] {
    return entries.map(({ customer, profile, metadata }) =>
      this.toViewDto(customer, profile, metadata),
    );
  }
}
