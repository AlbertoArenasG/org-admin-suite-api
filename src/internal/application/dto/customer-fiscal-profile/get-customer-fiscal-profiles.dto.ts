import {
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { CustomerFiscalProfileStatus, CustomerStatus } from '@domain/entities';

export interface CustomerFiscalProfileFileDescriptorDto {
  fileId: string;
  originalName: string;
  extension: string;
}

export interface CustomerFiscalProfileFilesMetadataDto {
  taxCertificate: CustomerFiscalProfileFileDescriptorDto | null;
  invoiceRequirements: CustomerFiscalProfileFileDescriptorDto | null;
}

export interface CustomerFiscalProfileContactDto {
  name: string;
  phone: string;
  email: string;
}

export interface CustomerFiscalProfileFormDto {
  businessName: string;
  rfc: string;
  taxRegime: string;
  street: string;
  number: string;
  neighborhood: string;
  delegation: string;
  city: string;
  postalCode: string;
  cfdiUse: string;
  paymentMethod: string;
  paymentForm: string;
  billingContact: CustomerFiscalProfileContactDto;
  accountsPayableContact: CustomerFiscalProfileContactDto;
  requirementsNotes: string | null;
}

export interface CustomerFiscalProfileDetailsDto {
  id: string;
  status: CustomerFiscalProfileStatus;
  formData: CustomerFiscalProfileFormDto | null;
  submittedAt: Date | null;
  taxCertificateFileId: string | null;
  invoiceRequirementsFileId: string | null;
  filesMetadata: CustomerFiscalProfileFilesMetadataDto;
}

export interface CustomerFiscalProfileViewDto {
  id: string;
  companyName: string;
  clientCode: string;
  status: CustomerStatus;
  publicAccessToken: string | null;
  createdAt: Date;
  updatedAt?: Date;
  fiscalProfile: CustomerFiscalProfileDetailsDto | null;
}

export interface GetCustomerFiscalProfilesDto extends PaginationParamsDto {
  search?: string | null;
  profileStatus?: CustomerFiscalProfileStatus | null;
  customerStatus?: CustomerStatus | null;
  sorts: Array<{
    field:
      | 'company_name'
      | 'client_code'
      | 'status'
      | 'customer_status'
      | 'profile_status'
      | 'created_at'
      | 'submitted_at';
    direction: 'asc' | 'desc';
  }>;
}

export type GetCustomerFiscalProfilesResultDto =
  PaginatedResultDto<CustomerFiscalProfileViewDto>;
