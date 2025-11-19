import { IsOptional, IsString } from 'class-validator';

import { UpdateCustomerDto } from '@application/dto';

export class UpdateCustomerRequestDto {
  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  client_code?: string;

  toDomain(customerId: string): UpdateCustomerDto {
    return {
      customerId,
      companyName: this.company_name,
      clientCode: this.client_code,
    };
  }
}
