import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { PaginationDefaultConfig } from '@src/config/pagination.config';

export class PaginationRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PaginationDefaultConfig.MIN_PAGE)
  @Max(PaginationDefaultConfig.MAX_PAGE)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PaginationDefaultConfig.MIN_LIMIT)
  @Max(PaginationDefaultConfig.MAX_LIMIT)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PaginationDefaultConfig.MIN_LIMIT)
  @Max(PaginationDefaultConfig.MAX_LIMIT)
  items_per_page?: number;

  protected resolvePage(): number {
    const page = this.page ?? PaginationDefaultConfig.PAGE;
    return Math.min(
      Math.max(page, PaginationDefaultConfig.MIN_PAGE),
      PaginationDefaultConfig.MAX_PAGE,
    );
  }

  protected resolvePerPage(): number {
    const perPage =
      this.limit ?? this.items_per_page ?? PaginationDefaultConfig.LIMIT;

    return Math.min(
      Math.max(perPage, PaginationDefaultConfig.MIN_LIMIT),
      PaginationDefaultConfig.MAX_LIMIT,
    );
  }

  getPage(): number {
    return this.resolvePage();
  }

  getPerPage(): number {
    return this.resolvePerPage();
  }
}
