import { ProviderViewDto } from './get-providers.dto';

export interface CreateProviderDto {
  companyName: string;
  providerCode: string;
  userId: string;
}

export type CreateProviderResultDto = ProviderViewDto;
