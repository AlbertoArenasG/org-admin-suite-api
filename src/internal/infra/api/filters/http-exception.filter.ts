import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponseBuilder } from '../responses/api-response.builder';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorDetails = {
      message,
      method: request.method,
      path: request.url,
    };

    const formattedResponse = ApiResponseBuilder.create()
      .withStatus(status)
      .withErrorDetails(errorDetails)
      .build();

    response.status(status).json(formattedResponse);
  }
}
