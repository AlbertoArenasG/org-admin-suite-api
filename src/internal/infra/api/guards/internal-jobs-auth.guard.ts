import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

import { AuthenticationException } from '@domain/exceptions';
import { EnvService } from '@infra/env';
import { extractBearerToken } from './utils';

@Injectable()
export class InternalJobsAuthGuard implements CanActivate {
  constructor(private readonly envService: EnvService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);
    const expectedToken = this.envService.get('INTERNAL_JOBS_TOKEN');

    if (!hasMatchingToken(token, expectedToken)) {
      throw AuthenticationException.tokenInvalid();
    }

    return true;
  }
}

function hasMatchingToken(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
