import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import {
  AuthenticatedActorDto,
  AuthenticatedActorType,
  AuthenticatedMasterDto,
  AuthenticatedTenantDto,
  MasterTokenPayloadDto,
  TenantAccessTokenPayloadDto,
  isMasterTokenPayloadDto,
  isTenantAccessTokenPayloadDto,
} from '@application/dto';
import { TenantUserRole, UserRole } from '@domain/entities';
import { AuthenticationException } from '@domain/exceptions';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    const payload = await this.verifyToken(token);
    const actor = this.buildActor(token, payload);

    request.authActor = actor;

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

  private buildActor(token: string, payload: unknown): AuthenticatedActorDto {
    if (this.isTenantPayload(payload)) {
      return this.buildTenantActor(token, payload);
    }

    if (this.isMasterPayload(payload)) {
      return this.buildMasterActor(token, payload);
    }

    throw AuthenticationException.tokenTypeUnrecognized(
      this.getPayloadType(payload),
    );
  }

  private buildTenantActor(
    token: string,
    payload: TenantAccessTokenPayloadDto,
  ): AuthenticatedTenantDto {
    if (!payload.sub || !payload.tenant_id || !payload.tenant_user_id) {
      throw AuthenticationException.tokenPayloadInvalid({
        tokenType: AuthenticatedActorType.TENANT,
      });
    }

    if (!Object.values(TenantUserRole).includes(payload.role)) {
      throw AuthenticationException.tokenRoleInvalid(String(payload.role));
    }

    return {
      type: AuthenticatedActorType.TENANT,
      userId: payload.sub,
      tenantId: payload.tenant_id,
      tenantUserId: payload.tenant_user_id,
      role: payload.role,
      token,
    };
  }

  private buildMasterActor(
    token: string,
    payload: MasterTokenPayloadDto,
  ): AuthenticatedMasterDto {
    if (!payload.sub) {
      throw AuthenticationException.tokenPayloadInvalid({
        tokenType: AuthenticatedActorType.MASTER,
      });
    }

    if (!this.isMasterRole(payload.role)) {
      throw AuthenticationException.tokenRoleInvalid(String(payload.role));
    }

    return {
      type: AuthenticatedActorType.MASTER,
      userId: payload.sub,
      role: payload.role,
      token,
    };
  }

  private isMasterPayload(payload: unknown): payload is MasterTokenPayloadDto {
    return isMasterTokenPayloadDto(payload);
  }

  private isTenantPayload(
    payload: unknown,
  ): payload is TenantAccessTokenPayloadDto {
    return isTenantAccessTokenPayloadDto(payload);
  }

  private isMasterRole(role: unknown): role is UserRole {
    return role === UserRole.MASTER_ADMIN || role === UserRole.MASTER_STAFF;
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

  private getPayloadType(payload: unknown): string {
    if (!payload || typeof payload !== 'object') {
      return 'unknown';
    }

    if ('tenant_id' in (payload as Record<string, unknown>)) {
      return 'tenant';
    }

    if ('role' in (payload as Record<string, unknown>)) {
      return 'master';
    }

    return 'unknown';
  }
}
