import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '@domain/entities';
import { AuthTokenMapper, TenantAccessAggregate } from '@application/mappers';

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generate(
    user: User,
    tenantAccesses: TenantAccessAggregate[],
    defaultTenantId?: string | null,
  ): Promise<string> {
    const payload = AuthTokenMapper.toUnifiedPayload(
      user,
      tenantAccesses,
      defaultTenantId ?? null,
    );

    return this.jwtService.signAsync(payload);
  }
}
