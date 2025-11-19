import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    // const args = context.getArgs();

    // this.logger.log(
    //   `Calling ${className}.${handlerName} with args: ${serializedArgs}`,
    // );

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `Finished ${className}.${handlerName} in ${Date.now() - now}ms`,
        );
      }),
      catchError((error) => {
        this.logger.error(`Error in ${className}.${handlerName}`, error.stack);
        return throwError(() => error);
      }),
    );
  }
}
