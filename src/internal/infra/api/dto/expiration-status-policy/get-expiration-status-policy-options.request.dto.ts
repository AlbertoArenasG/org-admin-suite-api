import { IsEnum, IsOptional, IsString } from 'class-validator';

import { GetExpirationStatusPolicyOptionsDto } from '@application/dto';
import { ExpirationStatusPolicyStatus } from '@domain/entities';

export class GetExpirationStatusPolicyOptionsRequestDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ExpirationStatusPolicyStatus)
  status?: ExpirationStatusPolicyStatus;

  toDomain(): GetExpirationStatusPolicyOptionsDto {
    return {
      search: this.search ?? null,
      status: this.status ?? null,
    };
  }
}
