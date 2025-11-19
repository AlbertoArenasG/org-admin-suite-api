import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import {
  AuthenticatedUserContextDto,
  isAuthTokenPayloadDto,
} from '@application/dto';
import { AuthenticationException } from '@domain/exceptions';
import {
  extractBearerToken,
  getJwtErrorName,
  isTokenExpiredError,
} from './utils';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);
    const payload = await this.verifyToken(token);
    const authContext = this.buildContext(token, payload);

    request.authContext = authContext;

    return true;
  }

  private async verifyToken(token: string): Promise<unknown> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      if (isTokenExpiredError(error)) {
        throw AuthenticationException.tokenExpired();
      }

      throw AuthenticationException.tokenInvalid({
        reason: getJwtErrorName(error),
      });
    }
  }

  private buildContext(
    token: string,
    payload: unknown,
  ): AuthenticatedUserContextDto {
    if (!isAuthTokenPayloadDto(payload)) {
      throw AuthenticationException.tokenPayloadInvalid({
        reason: 'unexpected_structure',
      });
    }

    const { sub, role, isMaster } = payload;

    if (!sub) {
      throw AuthenticationException.tokenPayloadInvalid({
        reason: 'missing_sub',
      });
    }

    return {
      userId: sub,
      role,
      isMaster,
      token,
    };
  }
}
