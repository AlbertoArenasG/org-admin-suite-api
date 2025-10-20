import { HttpStatus } from '@nestjs/common';

type Meta = Record<string, unknown>;
type Pagination = Record<string, unknown>;
type ErrorDetails = Record<string, unknown>;

export class ApiResponseBuilder<T> {
  private success = true;
  private success_message: string = 'DEFAULT';
  private status_code = HttpStatus.OK;
  private data?: T;
  private meta?: Meta;
  private pagination?: Pagination;
  private error_details?: ErrorDetails;

  static create() {
    return new ApiResponseBuilder();
  }

  withSuccess(success: boolean) {
    this.success = success;
    return this;
  }

  withSuccessMessage(successMessage: string) {
    this.success_message = successMessage;
    return this;
  }

  withStatus(statusCode: number) {
    this.status_code = statusCode;
    return this;
  }

  withErrorDetails(errorDetails: ErrorDetails) {
    this.error_details = errorDetails;
    return this.withSuccess(false);
  }

  withData(data: T) {
    this.data = data;
    return this;
  }

  withMeta(meta: Meta) {
    this.meta = Object.assign({}, this.meta, meta);
    return this;
  }

  withPagination(page: number, perPage: number, total: number) {
    const totalPages = Math.ceil(total / perPage);
    this.pagination = {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
    };
    return this;
  }

  build() {
    return {
      success: this.success,
      success_message: this.success_message,
      status_code: this.status_code,
      error_details: this.error_details,
      data: this.data,
      pagination: this.pagination,
      meta: this.meta,
    };
  }
}
