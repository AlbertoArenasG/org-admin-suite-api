import { IsOptional, IsString } from 'class-validator';

import { GetRecipientGroupOptionsDto } from '@application/dto';

export class GetRecipientGroupOptionsRequestDto {
  @IsOptional()
  @IsString()
  search?: string;

  toDomain(): GetRecipientGroupOptionsDto {
    return { search: this.search ?? null };
  }
}
