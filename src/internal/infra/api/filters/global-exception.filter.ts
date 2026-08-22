import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';

import { ErrorMessageService } from '@infra/i18n/services';
import { ApiResponseBuilder } from '../responses/api-response.builder';
import { GlobalExceptionMapper } from './global-exception.mapper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly mapper: GlobalExceptionMapper;

  constructor(errorMsgService: ErrorMessageService) {
    this.mapper = new GlobalExceptionMapper(errorMsgService);
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const { status, errorCode, message, validationErrors, details } =
      await this.mapper.map(exception);

    const errorDetails = {
      message,
      method: request.method,
      path: request.url,
      error_code: errorCode,
      validation_errors: validationErrors,
      ...details,
    };

    const formattedResponse = ApiResponseBuilder.create()
      .withStatus(status)
      .withErrorDetails(errorDetails)
      .build();

    response.status(status).json(formattedResponse);
  }
}
