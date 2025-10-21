import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  ITenantReadRepository,
  ITenantReadRepositoryToken,
  ITenantUserReadRepository,
  ITenantUserReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  AuthenticatedTenantAccessDto,
  TenantAccessTokenPayloadDto,
} from '@application/dto';
import {
  TenantUser,
  TenantUserStatus,
  User,
  TenantStatus,
} from '@domain/entities';
import {
  AuthTokenMapper,
  AuthenticateUserResultMapper,
} from '@application/mappers';

@Injectable()
export class TenantAccessService {
  constructor(
    @Inject(ITenantUserReadRepositoryToken)
    private readonly tenantUserReadRepo: ITenantUserReadRepository,
    @Inject(ITenantReadRepositoryToken)
    private readonly tenantReadRepo: ITenantReadRepository,
    private readonly jwtService: JwtService,
  ) {}

  async generateFor(user: User): Promise<AuthenticatedTenantAccessDto[]> {
    const { data } = await this.tenantUserReadRepo.findManyByUserId(user.id!);

    if (!data.length) return [];

    const activeTenantUsers = data.filter(
      (tenantUser) =>
        tenantUser.status === TenantUserStatus.ACTIVE && Boolean(tenantUser.id),
    );

    const tenantAccesses = await Promise.all(
      activeTenantUsers.map((tenantUser) =>
        this.createTenantAccess(user, tenantUser),
      ),
    );

    return tenantAccesses.filter(
      (tenantAccess): tenantAccess is AuthenticatedTenantAccessDto =>
        tenantAccess !== null,
    );
  }

  private async createTenantAccess(
    user: User,
    tenantUser: TenantUser,
  ): Promise<AuthenticatedTenantAccessDto | null> {
    const { data: tenant } = await this.tenantReadRepo.findById(
      tenantUser.tenantId,
    );

    const isTenantActive = tenant && tenant.status === TenantStatus.ACTIVE;

    if (!isTenantActive) return null;

    const payload: TenantAccessTokenPayloadDto =
      AuthTokenMapper.toTenantPayload(user, tenantUser);

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return AuthenticateUserResultMapper.toTenantAccessDto({
      tenantUser,
      tenant: tenant ?? null,
      accessToken,
    });
  }
}
