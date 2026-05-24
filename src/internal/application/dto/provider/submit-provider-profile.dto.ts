import {
  ProviderFiscalProfileFormData,
  ProviderBankingInfoFormData,
} from '@domain/entities';

export interface ProviderContactDto {
  name: string;
  phone: string;
  email: string;
}

export interface SubmitProviderProfileDto {
  token: string;
  contact: ProviderContactDto;
  fiscalProfile: {
    formData: ProviderFiscalProfileFormData;
    taxStatusCertificateFileId: string;
    taxComplianceOpinionFileId: string;
    addressProofFileId: string;
  };
  bankingInfo: {
    formData: ProviderBankingInfoFormData;
    bankStatementFileId: string;
  };
}
