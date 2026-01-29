import { Customer, CustomerFiscalProfile } from '@domain/entities';
import {
  CreateCustomerFiscalProfileResultDto,
  CustomerFiscalProfileViewDto,
  CustomerFiscalProfileFilesMetadataDto,
  AuditUserDto,
} from '@application/dto';
import { createEmptyCustomerFiscalProfileFilesMetadata } from '@application/utils';

export class CustomerFiscalProfileMapper {
  static toCreateResultDto(
    customer: Customer,
    profile: CustomerFiscalProfile,
    filesMetadata?: CustomerFiscalProfileFilesMetadataDto,
    createdByUser?: AuditUserDto | null,
  ): CreateCustomerFiscalProfileResultDto {
    return this.toViewDto(
      customer,
      profile,
      filesMetadata,
      createdByUser,
      null,
    );
  }

  static toViewDto(
    customer: Customer,
    profile: CustomerFiscalProfile | null,
    filesMetadata?: CustomerFiscalProfileFilesMetadataDto,
    createdByUser?: AuditUserDto | null,
    updatedByUser?: AuditUserDto | null,
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
      createdBy: createdByUser ?? null,
      updatedBy: updatedByUser ?? null,
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
      createdByUser?: AuditUserDto | null;
      updatedByUser?: AuditUserDto | null;
    }>,
  ): CustomerFiscalProfileViewDto[] {
    return entries.map(
      ({ customer, profile, metadata, createdByUser, updatedByUser }) =>
        this.toViewDto(
          customer,
          profile,
          metadata,
          createdByUser,
          updatedByUser,
        ),
    );
  }
}
