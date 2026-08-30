import { IsOptional, IsString } from 'class-validator';

export class GetCustomerRelatedUserOptionsRequestDto {
  @IsOptional()
  @IsString()
  search?: string;
}
