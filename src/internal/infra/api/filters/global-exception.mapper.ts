import { HttpException, HttpStatus } from '@nestjs/common';

import {
  AuthenticationException,
  AuthenticationExceptionCode,
  AuthorizationException,
  AuthorizationExceptionCode,
  DomainException,
  EntityAlreadyExistsException,
  InvalidValueException,
  InvalidValueExceptionCode,
  EntityNotFoundException,
} from '@domain/exceptions';
import { ErrorMessageService } from '@infra/i18n/services';

type ValidationErrors = string[] | Record<string, unknown>;

export interface ExceptionMapping {
  status: number;
  errorCode: string;
  message: string;
  validationErrors: ValidationErrors;
}

export class GlobalExceptionMapper {
  constructor(private readonly errorMsgService: ErrorMessageService) {}

  /**
   * Maps an exception to an exception mapping.
   *
   * The exception mapping contains the HTTP status code, the error code, the translated error message, and the validation errors (if any).
   *
   * @param {unknown} exception The exception to map.
   * @returns {Promise<ExceptionMapping>} The exception mapping.
   */
  async map(exception: unknown): Promise<ExceptionMapping> {
    const status = this.getHttpStatusCode(exception);
    const errorCode = this.getErrorCode(exception);
    const message = await this.getErrorMessage(exception);
    const validationErrors = this.getValidationErrorDetails(exception);

    return {
      status,
      errorCode,
      message,
      validationErrors,
    };
  }

  /**
   * Retrieves the translated error message for the given exception.
   * If the exception is a HttpException with a message of 'Bad Request Exception',
   * the default invalid value exception code is used to retrieve the translated error message.
   * If the exception is a HttpException, its message is returned.
   * If the exception is a DomainException, the error message is retrieved from the error message service using the exception's code and details.
   * Otherwise, 'Internal server error' is returned.
   * @param exception The exception to retrieve the error message for.
   * @returns The translated error message.
   */
  private async getErrorMessage(exception: unknown): Promise<string> {
    if (
      exception instanceof HttpException &&
      exception.message === 'Bad Request Exception'
    ) {
      return this.errorMsgService.getMsg(InvalidValueExceptionCode.DEFAULT);
    }

    if (exception instanceof HttpException) {
      return exception.message;
    }

    if (exception instanceof DomainException) {
      return this.errorMsgService.getMsg(exception.code, exception.details);
    }

    return 'Internal server error';
  }

  /**
   * Returns the HTTP status code for the given exception.
   * If the exception is a HttpException, its status is returned.
   * If the exception is a DomainException, it is mapped to a HTTP status code.
   * Otherwise, HttpStatus.INTERNAL_SERVER_ERROR is returned.
   * @param exception The exception to get the HTTP status code for.
   * @returns The HTTP status code for the exception.
   */
  private getHttpStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof DomainException) {
      return this.mapDomainExceptionToHttpStatus(exception);
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Returns the error code for the given exception.
   *
   * If the exception is a HttpException with a message of 'Bad Request Exception',
   * returns the default invalid value exception code.
   * If the exception is a HttpException, returns its message.
   * If the exception is a DomainException, returns its code.
   * Otherwise, returns 'INTERNAL_SERVER_ERROR'.
   * @param exception The exception to get the error code for.
   * @returns The error code for the given exception.
   */
  private getErrorCode(exception: unknown): string {
    if (
      exception instanceof HttpException &&
      exception.message === 'Bad Request Exception'
    ) {
      return InvalidValueExceptionCode.DEFAULT;
    }

    if (exception instanceof HttpException) {
      return exception.message;
    }

    if (exception instanceof DomainException) {
      return exception.code;
    }

    return 'INTERNAL_SERVER_ERROR';
  }

  /**
   * Retrieves the validation errors from the given exception.
   * If the exception is an instance of HttpException and its message is 'Bad Request Exception',
   * the validation errors are extracted from the exception's response.
   * Otherwise, an empty array is returned.
   * @param exception The exception to retrieve the validation errors from.
   * @returns The validation errors, or an empty array if none are found.
   */
  private getValidationErrorDetails(exception: unknown): ValidationErrors {
    if (
      exception instanceof HttpException &&
      exception.message === 'Bad Request Exception'
    ) {
      const response = exception.getResponse() as Record<string, unknown>;

      if (response.message) {
        return response.message as ValidationErrors;
      }
    }

    return [];
  }

  /**
   * Maps a domain exception to a HTTP status code.
   * @param {DomainException} domainException The domain exception to map.
   * @returns {number} The HTTP status code corresponding to the domain exception.
   */
  private mapDomainExceptionToHttpStatus(
    domainException: DomainException,
  ): number {
    if (domainException instanceof EntityNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }

    if (domainException instanceof EntityAlreadyExistsException) {
      return HttpStatus.CONFLICT;
    }

    if (domainException instanceof InvalidValueException) {
      return HttpStatus.BAD_REQUEST;
    }

    if (domainException instanceof AuthenticationException) {
      return domainException.code === AuthenticationExceptionCode.USER_INACTIVE
        ? HttpStatus.FORBIDDEN
        : HttpStatus.UNAUTHORIZED;
    }

    if (domainException instanceof AuthorizationException) {
      if (
        domainException.code ===
        AuthorizationExceptionCode.TENANT_IDENTIFIER_REQUIRED
      ) {
        return HttpStatus.BAD_REQUEST;
      }

      return HttpStatus.FORBIDDEN;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
