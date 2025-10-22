import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import {
  AuthenticatedUserContextDto,
  AuthTokenTenantClaimDto,
  isAuthTokenPayloadDto,
} from '@application/dto';
import { AuthenticationException } from '@domain/exceptions';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    const payload = await this.verifyToken(token);
    const authContext = this.buildContext(token, payload);

    request.authContext = authContext;
    request.activeTenant = null;

    return true;
  }

  private extractToken(request: Request): string {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw AuthenticationException.tokenMissing();
    }

    if (Array.isArray(authHeader)) {
      throw AuthenticationException.authorizationHeaderInvalid({
        reason: 'multiple_values',
      });
    }

    const parts = authHeader.trim().split(/\s+/);

    if (parts.length !== 2) {
      throw AuthenticationException.authorizationHeaderInvalid({
        reason: 'unexpected_format',
      });
    }

    const [scheme, token] = parts;

    if (!scheme || scheme.toLowerCase() !== 'bearer') {
      throw AuthenticationException.authorizationHeaderInvalid({
        expectedScheme: 'Bearer',
        actualScheme: scheme,
      });
    }

    if (!token) {
      throw AuthenticationException.tokenMissing();
    }

    return token;
  }

  private async verifyToken(token: string): Promise<unknown> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      if (this.isTokenExpiredError(error)) {
        throw AuthenticationException.tokenExpired();
      }

      throw AuthenticationException.tokenInvalid({
        reason: this.getJwtErrorName(error),
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

    const { sub, role, isMaster, tenants, defaultTenantId } = payload;

    if (!sub) {
      throw AuthenticationException.tokenPayloadInvalid({
        reason: 'missing_sub',
      });
    }

    this.ensureValidTenants(tenants, isMaster);
    this.ensureValidDefaultTenant(tenants, defaultTenantId, isMaster);

    return {
      userId: sub,
      role,
      isMaster,
      token,
      tenants,
      defaultTenantId: defaultTenantId ?? null,
    };
  }

  private ensureValidTenants(
    tenants: AuthTokenTenantClaimDto[],
    isMaster: boolean,
  ): void {
    if (isMaster) {
      return;
    }

    const hasInvalidTenant = tenants.some(
      (tenant) =>
        !tenant.tenantId ||
        !tenant.tenantUserId ||
        !tenant.role ||
        typeof tenant.tenantId !== 'string' ||
        typeof tenant.tenantUserId !== 'string' ||
        typeof tenant.role !== 'string',
    );

    if (hasInvalidTenant) {
      throw AuthenticationException.tokenPayloadInvalid({
        reason: 'invalid_tenant_claim',
      });
    }
  }

  private ensureValidDefaultTenant(
    tenants: AuthTokenTenantClaimDto[],
    defaultTenantId: string | null | undefined,
    isMaster: boolean,
  ): void {
    if (!defaultTenantId) return;

    if (isMaster) return;

    const matchesTenant = tenants.some(
      (tenant) => tenant.tenantId === defaultTenantId,
    );

    if (!matchesTenant) {
      throw AuthenticationException.tokenPayloadInvalid({
        reason: 'default_tenant_not_found',
      });
    }
  }

  private isTokenExpiredError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: string }).name === 'TokenExpiredError'
    );
  }

  private getJwtErrorName(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'name' in error) {
      return String((error as { name?: string }).name);
    }

    return 'Unknown';
  }
}
