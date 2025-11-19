import { IsNotEmpty, IsString } from 'class-validator';

import { CreateCustomerFiscalProfileDto } from '@application/dto';

export class CreateCustomerFiscalProfileRequestDto {
  @IsNotEmpty()
  @IsString()
  company_name!: string;

  @IsNotEmpty()
  @IsString()
  client_code!: string;

  toDomain(): CreateCustomerFiscalProfileDto {
    return {
      companyName: this.company_name,
      clientCode: this.client_code,
    };
  }
}
