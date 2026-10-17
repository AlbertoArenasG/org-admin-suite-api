import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Multer } from 'multer';
import { randomUUID } from 'crypto';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ServicePackageUploadAlertService } from '@infra/notification/services/service-package-upload-alert.service';

type UploadRequest = Request & { file?: Multer.File };

@Injectable()
export class ServicePackageUploadAlertInterceptor implements NestInterceptor {
  private readonly logger = new Logger(
    ServicePackageUploadAlertInterceptor.name,
  );

  constructor(private readonly alerts: ServicePackageUploadAlertService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<UploadRequest>();
    const attemptId = randomUUID();
    const attemptedAt = new Date();
    const declaredOrigin = request.query?.origin;
    const origin =
      typeof declaredOrigin === 'string' && declaredOrigin.trim()
        ? declaredOrigin.trim().slice(0, 80)
        : 'sin parámetro (PWA actual, presunto)';

    return next.handle().pipe(
      tap((response: unknown) => {
        this.logger.log(`Upload ${attemptId} processed successfully`);
        void this.alerts
          .notify({
            attemptId,
            attemptedAt,
            origin,
            file: request.file,
            outcome: 'success',
            response,
          })
          .catch((error) => this.logAlertFailure(attemptId, error));
      }),
      catchError((error: unknown) => {
        this.logger.error(`Upload ${attemptId} failed`, error);
        void this.alerts
          .notify({
            attemptId,
            attemptedAt,
            origin,
            file: request.file,
            outcome: 'failure',
            error,
          })
          .catch((alertError) => this.logAlertFailure(attemptId, alertError));
        return throwError(() => error);
      }),
    );
  }

  private logAlertFailure(attemptId: string, error: unknown): void {
    this.logger.error(`Could not send upload alert ${attemptId}`, error);
  }
}
