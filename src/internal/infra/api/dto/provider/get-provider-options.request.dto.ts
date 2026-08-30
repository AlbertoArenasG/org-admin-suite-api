import { IsOptional, IsString } from 'class-validator';

import { GetProviderOptionsDto } from '@application/dto';

export class GetProviderOptionsRequestDto {
  @IsOptional()
  @IsString()
  search?: string;

  toDomain(): GetProviderOptionsDto {
    return { search: this.search ?? null };
  }
}
