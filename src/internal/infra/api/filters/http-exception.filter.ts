import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import {
  DomainException,
  EntityAlreadyExistsException,
  InvalidValueException,
} from '@domain/exceptions';
import { ErrorMessageService } from '@infra/i18n/services';
import { ApiResponseBuilder } from '../responses/api-response.builder';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  constructor(private readonly errorMsgService: ErrorMessageService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof DomainException) {
      console.log('\n\n\n\n\n\n\n');
      console.log('exception =>');
      console.log(exception);
      console.log('\n');
      console.log('exception.code =>');
      console.log(exception.code);
      console.log('\n\n\n\n\n\n\n');
    }

    if (exception instanceof HttpException) {
      console.log('\n\n\n\n\n\n\n');
      console.log('exception =>');
      console.log('\n');
      console.log(exception);
      console.log('\n');
      console.log(exception.getResponse());
      console.log(exception.message);
      console.log('\n\n\n\n\n\n\n');
    }

    console.log('\n\n\n\n\n\n\n');
    console.log('typeof exception =>');
    console.log('\n');
    console.log(typeof exception);
    console.log('\n\n\n\n\n\n\n');

    const status = this.getHttpStatusCode(exception);
    const errorCode = this.getErrorCode(exception);
    const message = await this.getErrorMessage(exception);

    const errorDetails = {
      message,
      method: request.method,
      path: request.url,
      code: errorCode,
    };

    const formattedResponse = ApiResponseBuilder.create()
      .withStatus(status)
      .withErrorDetails(errorDetails)
      .build();

    response.status(status).json(formattedResponse);
  }

  private async getErrorMessage(exception: unknown): Promise<string> {
    return exception instanceof HttpException
      ? exception.message
      : exception instanceof DomainException
        ? await this.errorMsgService.getMsg(exception.code, exception.details)
        : 'Internal server error';
  }

  private getHttpStatusCode(exception: unknown): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : exception instanceof DomainException
        ? this.mapToHttpStatusCode(exception)
        : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorCode(exception: unknown): string {
    return exception instanceof HttpException &&
      exception.message == 'Bad Request Exception'
      ? exception.message
      : exception instanceof DomainException
        ? exception.code
        : 'INTERNAL_SERVER_ERROR';
  }

  private mapToHttpStatusCode(domainException: DomainException): number {
    if (domainException instanceof EntityAlreadyExistsException) {
      return HttpStatus.CONFLICT;
    }

    if (domainException instanceof InvalidValueException) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
