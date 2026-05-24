import {
  Provider,
  ProviderFiscalProfile,
  ProviderBankingInfo,
} from '@domain/entities';
import {
  CreateProviderResultDto,
  ProviderViewDto,
  ProviderFiscalProfileFilesMetadataDto,
  ProviderBankingInfoFilesMetadataDto,
  AuditUserDto,
} from '@application/dto';
import {
  createEmptyProviderFiscalProfileFilesMetadata,
  createEmptyProviderBankingInfoFilesMetadata,
} from '@application/utils';

export class ProviderMapper {
  static toCreateResultDto(
    provider: Provider,
    fiscalProfile: ProviderFiscalProfile,
    bankingInfo: ProviderBankingInfo,
    fiscalProfileFilesMetadata?: ProviderFiscalProfileFilesMetadataDto,
    bankingInfoFilesMetadata?: ProviderBankingInfoFilesMetadataDto,
    createdByUser?: AuditUserDto | null,
  ): CreateProviderResultDto {
    return this.toViewDto(
      provider,
      fiscalProfile,
      bankingInfo,
      fiscalProfileFilesMetadata,
      bankingInfoFilesMetadata,
      createdByUser,
      null,
    );
  }

  static toViewDto(
    provider: Provider,
    fiscalProfile: ProviderFiscalProfile | null,
    bankingInfo: ProviderBankingInfo | null,
    fiscalProfileFilesMetadata?: ProviderFiscalProfileFilesMetadataDto,
    bankingInfoFilesMetadata?: ProviderBankingInfoFilesMetadataDto,
    createdByUser?: AuditUserDto | null,
    updatedByUser?: AuditUserDto | null,
  ): ProviderViewDto {
    const fiscalProfileDetails = fiscalProfile
      ? {
          id: fiscalProfile.id,
          status: fiscalProfile.status,
          formData: fiscalProfile.formData,
          submittedAt: fiscalProfile.submittedAt,
          taxStatusCertificateFileId: fiscalProfile.taxStatusCertificateFileId,
          taxComplianceOpinionFileId: fiscalProfile.taxComplianceOpinionFileId,
          addressProofFileId: fiscalProfile.addressProofFileId,
          filesMetadata:
            fiscalProfileFilesMetadata ??
            createEmptyProviderFiscalProfileFilesMetadata(),
        }
      : null;

    const bankingInfoDetails = bankingInfo
      ? {
          id: bankingInfo.id,
          status: bankingInfo.status,
          formData: bankingInfo.formData,
          submittedAt: bankingInfo.submittedAt,
          bankStatementFileId: bankingInfo.bankStatementFileId,
          filesMetadata:
            bankingInfoFilesMetadata ??
            createEmptyProviderBankingInfoFilesMetadata(),
        }
      : null;

    return {
      id: provider.id,
      companyName: provider.companyName,
      providerCode: provider.providerCode,
      publicAccessToken: provider.accessToken ?? null,
      status: provider.status,
      contact: {
        name: provider.contact?.name ?? null,
        phone: provider.contact?.phone ?? null,
        email: provider.contact?.email ?? null,
      },
      createdBy: createdByUser ?? null,
      updatedBy: updatedByUser ?? null,
      createdAt: provider.createdAt ?? new Date(),
      updatedAt: provider.updatedAt,
      fiscalProfile: fiscalProfileDetails,
      bankingInfo: bankingInfoDetails,
    };
  }

  static toCollection(
    entries: Array<{
      provider: Provider;
      fiscalProfile: ProviderFiscalProfile | null;
      bankingInfo: ProviderBankingInfo | null;
      fiscalProfileFilesMetadata?: ProviderFiscalProfileFilesMetadataDto;
      bankingInfoFilesMetadata?: ProviderBankingInfoFilesMetadataDto;
      createdByUser?: AuditUserDto | null;
      updatedByUser?: AuditUserDto | null;
    }>,
  ): ProviderViewDto[] {
    return entries.map(
      ({
        provider,
        fiscalProfile,
        bankingInfo,
        fiscalProfileFilesMetadata,
        bankingInfoFilesMetadata,
        createdByUser,
        updatedByUser,
      }) =>
        this.toViewDto(
          provider,
          fiscalProfile,
          bankingInfo,
          fiscalProfileFilesMetadata,
          bankingInfoFilesMetadata,
          createdByUser,
          updatedByUser,
        ),
    );
  }
}
