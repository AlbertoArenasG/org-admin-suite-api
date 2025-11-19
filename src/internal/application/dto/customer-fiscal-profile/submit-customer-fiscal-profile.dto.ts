import { CustomerFiscalProfileFormDto } from './get-customer-fiscal-profiles.dto';

export interface SubmitCustomerFiscalProfileDto {
  token: string;
  formData: CustomerFiscalProfileFormDto;
  taxCertificateFileId: string;
  invoiceRequirementsFileId?: string | null;
}
