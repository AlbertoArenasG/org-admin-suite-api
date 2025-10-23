export interface PaginationParamsDto {
  page: number;
  perPage: number;
}

export interface PaginatedResultDto<T> extends PaginationParamsDto {
  total: number;
  items: T[];
}
