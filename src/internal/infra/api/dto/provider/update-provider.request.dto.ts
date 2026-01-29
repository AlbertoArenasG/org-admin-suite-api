import { IsOptional, IsString } from 'class-validator';

import { UpdateProviderDto } from '@application/dto';

export class UpdateProviderRequestDto {
  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  provider_code?: string;

  toDomain(providerId: string, userId: string): UpdateProviderDto {
    return {
      providerId,
      companyName: this.company_name,
      providerCode: this.provider_code,
      userId,
    };
  }
}
