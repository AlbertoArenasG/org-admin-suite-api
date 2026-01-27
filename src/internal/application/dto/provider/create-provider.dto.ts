import { ProviderViewDto } from './get-providers.dto';

export interface CreateProviderDto {
  companyName: string;
  providerCode: string;
}

export type CreateProviderResultDto = ProviderViewDto;
