import { Injectable } from '@nestjs/common';

import {
  CreateProviderResultDto,
  ProviderViewDto,
  ProviderFiscalProfileDetailsDto,
  ProviderBankingInfoDetailsDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';
import { EnvService } from '@infra/env';

@Injectable()
export class ProviderPresenter {
  private readonly apiBaseUrl: string;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly enumNameService: EnumNameService,
    private readonly envService: EnvService,
  ) {
    const apiBase = this.envService.get('API_BASE_URL');
    this.apiBaseUrl = apiBase.replace(/\/$/, '');

    const publicBase = this.envService.get('PROVIDER_PUBLIC_PROFILE_BASE_URL');
    this.publicBaseUrl = publicBase.replace(/\/$/, '');
  }

  toCreateResponse(result: CreateProviderResultDto) {
    return this.toViewResponse(result);
  }

  toViewResponse(provider: ProviderViewDto) {
    return {
      provider_id: provider.id,
      company_name: provider.companyName,
      provider_code: provider.providerCode,
      provider_status_id: provider.status,
      provider_status_name: this.enumNameService.getEnumName(
        `PROVIDER.STATUS.${provider.status}`,
      ),
      public_access_token: provider.publicAccessToken,
      public_access_url: provider.publicAccessToken
        ? this.buildPublicUrl(provider.publicAccessToken)
        : null,
      contact: {
        name: provider.contact.name,
        phone: provider.contact.phone,
        email: provider.contact.email,
      },
      created_by: provider.createdBy
        ? {
            user_id: provider.createdBy.userId,
            name: provider.createdBy.name,
            email: provider.createdBy.email,
          }
        : null,
      updated_by: provider.updatedBy
        ? {
            user_id: provider.updatedBy.userId,
            name: provider.updatedBy.name,
            email: provider.updatedBy.email,
          }
        : null,
      created_at: provider.createdAt,
      updated_at: provider.updatedAt ?? null,
      fiscal_profile: provider.fiscalProfile
        ? this.toFiscalProfileResponse(provider.fiscalProfile)
        : null,
      banking_info: provider.bankingInfo
        ? this.toBankingInfoResponse(provider.bankingInfo)
        : null,
    };
  }

  toCollection(providers: ProviderViewDto[]) {
    return providers.map((provider) => this.toViewResponse(provider));
  }

  private toFiscalProfileResponse(
    fiscalProfile: ProviderFiscalProfileDetailsDto,
  ): Record<string, unknown> {
    return {
      profile_id: fiscalProfile.id,
      status_id: fiscalProfile.status,
      status_name: this.enumNameService.getEnumName(
        `PROVIDER_FISCAL_PROFILE.STATUS.${fiscalProfile.status}`,
      ),
      submitted_at: fiscalProfile.submittedAt,
      form_data: fiscalProfile.formData,
      tax_status_certificate_file_id: fiscalProfile.taxStatusCertificateFileId,
      tax_compliance_opinion_file_id: fiscalProfile.taxComplianceOpinionFileId,
      address_proof_file_id: fiscalProfile.addressProofFileId,
      files_metadata: this.toFiscalProfileFilesMetadataResponse(
        fiscalProfile.filesMetadata,
      ),
    };
  }

  private toBankingInfoResponse(
    bankingInfo: ProviderBankingInfoDetailsDto,
  ): Record<string, unknown> {
    return {
      banking_info_id: bankingInfo.id,
      status_id: bankingInfo.status,
      status_name: this.enumNameService.getEnumName(
        `PROVIDER_BANKING_INFO.STATUS.${bankingInfo.status}`,
      ),
      submitted_at: bankingInfo.submittedAt,
      form_data: bankingInfo.formData,
      bank_statement_file_id: bankingInfo.bankStatementFileId,
      files_metadata: this.toBankingInfoFilesMetadataResponse(
        bankingInfo.filesMetadata,
      ),
    };
  }

  private buildPublicUrl(token: string): string {
    return `${this.publicBaseUrl}/${token}`;
  }

  private toFiscalProfileFilesMetadataResponse(metadata: any) {
    return {
      tax_status_certificate: metadata.taxStatusCertificate
        ? this.toFileDescriptorResponse(metadata.taxStatusCertificate)
        : null,
      tax_compliance_opinion: metadata.taxComplianceOpinion
        ? this.toFileDescriptorResponse(metadata.taxComplianceOpinion)
        : null,
      address_proof: metadata.addressProof
        ? this.toFileDescriptorResponse(metadata.addressProof)
        : null,
    };
  }

  private toBankingInfoFilesMetadataResponse(metadata: any) {
    return {
      bank_statement: metadata.bankStatement
        ? this.toFileDescriptorResponse(metadata.bankStatement)
        : null,
    };
  }

  private toFileDescriptorResponse(descriptor: {
    fileId: string;
    originalName: string;
    extension: string;
  }) {
    return {
      file_id: descriptor.fileId,
      original_name: descriptor.originalName,
      extension: descriptor.extension,
      download_url: this.buildDownloadUrl(descriptor.fileId),
    };
  }

  private buildDownloadUrl(fileId: string): string {
    return `${this.apiBaseUrl}/v1/files/${fileId}/download`;
  }
}
