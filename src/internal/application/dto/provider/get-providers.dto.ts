import {
  ProviderStatus,
  ProviderFiscalProfileStatus,
  ProviderBankingInfoStatus,
  ProviderFiscalProfileFormData,
  ProviderBankingInfoFormData,
} from '@domain/entities';
import {
  PaginatedResultDto,
  PaginationParamsDto,
  AuditUserDto,
} from '@application/dto/shared';

export interface ProviderFileDescriptorDto {
  fileId: string;
  originalName: string;
  extension: string;
}

export interface ProviderFiscalProfileFilesMetadataDto {
  taxStatusCertificate: ProviderFileDescriptorDto | null;
  taxComplianceOpinion: ProviderFileDescriptorDto | null;
  addressProof: ProviderFileDescriptorDto | null;
}

export interface ProviderBankingInfoFilesMetadataDto {
  bankStatement: ProviderFileDescriptorDto | null;
}

export interface ProviderFiscalProfileDetailsDto {
  id: string;
  status: ProviderFiscalProfileStatus;
  formData: ProviderFiscalProfileFormData | null;
  submittedAt: Date | null;
  taxStatusCertificateFileId: string | null;
  taxComplianceOpinionFileId: string | null;
  addressProofFileId: string | null;
  filesMetadata: ProviderFiscalProfileFilesMetadataDto;
}

export interface ProviderBankingInfoDetailsDto {
  id: string;
  status: ProviderBankingInfoStatus;
  formData: ProviderBankingInfoFormData | null;
  submittedAt: Date | null;
  bankStatementFileId: string | null;
  filesMetadata: ProviderBankingInfoFilesMetadataDto;
}

export interface ProviderViewDto {
  id: string;
  companyName: string;
  providerCode: string;
  publicAccessToken: string | null;
  status: ProviderStatus;
  contact: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  createdBy: AuditUserDto | null;
  updatedBy: AuditUserDto | null;
  createdAt: Date;
  updatedAt?: Date;
  fiscalProfile: ProviderFiscalProfileDetailsDto | null;
  bankingInfo: ProviderBankingInfoDetailsDto | null;
}

export interface ProviderPublicAccessViewDto {
  providerId: string;
  publicAccessToken: string | null;
}

export interface GetProvidersDto extends PaginationParamsDto {
  search?: string | null;
  status?: ProviderStatus | null;
  fiscalProfileStatus?: ProviderFiscalProfileStatus | null;
  bankingInfoStatus?: ProviderBankingInfoStatus | null;
  sorts: Array<{
    field:
      | 'company_name'
      | 'provider_code'
      | 'provider_status'
      | 'fiscal_profile_status'
      | 'banking_info_status'
      | 'created_at';
    direction: 'asc' | 'desc';
  }>;
}

export type GetProvidersResultDto = PaginatedResultDto<ProviderViewDto>;
