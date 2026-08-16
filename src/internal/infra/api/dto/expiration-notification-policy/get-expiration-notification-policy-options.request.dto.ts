import { IsEnum, IsOptional, IsString } from 'class-validator';

import { GetExpirationNotificationPolicyOptionsDto } from '@application/dto';
import { ExpirationNotificationPolicyStatus } from '@domain/entities';

export class GetExpirationNotificationPolicyOptionsRequestDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ExpirationNotificationPolicyStatus)
  status?: ExpirationNotificationPolicyStatus;

  toDomain(): GetExpirationNotificationPolicyOptionsDto {
    return {
      search: this.search ?? null,
      status: this.status ?? null,
    };
  }
}
