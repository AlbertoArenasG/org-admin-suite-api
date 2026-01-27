import { IsNotEmpty, IsString } from 'class-validator';

import { CreateProviderDto } from '@application/dto';

export class CreateProviderRequestDto {
  @IsNotEmpty()
  @IsString()
  company_name!: string;

  @IsNotEmpty()
  @IsString()
  provider_code!: string;

  toDomain(): CreateProviderDto {
    return {
      companyName: this.company_name,
      providerCode: this.provider_code,
    };
  }
}
