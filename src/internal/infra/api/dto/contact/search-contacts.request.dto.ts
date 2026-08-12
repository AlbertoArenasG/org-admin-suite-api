import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { SearchContactsDto } from '@application/dto';

export class SearchContactsRequestDto {
  @IsString()
  q!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => Number(value))
  limit?: number;

  toDomain(): SearchContactsDto {
    return {
      q: this.q,
      limit: this.limit ?? 10,
    };
  }
}
