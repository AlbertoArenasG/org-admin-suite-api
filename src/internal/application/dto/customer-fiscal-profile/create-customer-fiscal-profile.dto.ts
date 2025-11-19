import { CustomerFiscalProfileViewDto } from './get-customer-fiscal-profiles.dto';

export interface CreateCustomerFiscalProfileDto {
  companyName: string;
  clientCode: string;
}

export type CreateCustomerFiscalProfileResultDto = CustomerFiscalProfileViewDto;
