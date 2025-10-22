import { Inject, Injectable } from '@nestjs/common';

import {
  ITenantReadRepository,
  ITenantReadRepositoryToken,
  ITenantUserReadRepository,
  ITenantUserReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  TenantUser,
  TenantUserStatus,
  TenantStatus,
  User,
} from '@domain/entities';
import {
  AuthTokenMapper,
  AuthenticateUserResultMapper,
  TenantAccessAggregate,
} from '@application/mappers';

@Injectable()
export class TenantAccessService {
  constructor(
    @Inject(ITenantUserReadRepositoryToken)
    private readonly tenantUserReadRepo: ITenantUserReadRepository,
    @Inject(ITenantReadRepositoryToken)
    private readonly tenantReadRepo: ITenantReadRepository,
  ) {}

  async generateFor(user: User): Promise<TenantAccessAggregate[]> {
    const { data } = await this.tenantUserReadRepo.findManyByUserId(user.id!);

    if (!data.length) return [];

    const activeTenantUsers = data.filter(
      (tenantUser) =>
        tenantUser.status === TenantUserStatus.ACTIVE && Boolean(tenantUser.id),
    );

    const tenantAccesses = await Promise.all(
      activeTenantUsers.map((tenantUser) =>
        this.createTenantAccess(tenantUser),
      ),
    );

    return tenantAccesses.filter(
      (tenantAccess): tenantAccess is TenantAccessAggregate =>
        tenantAccess !== null,
    );
  }

  private async createTenantAccess(
    tenantUser: TenantUser,
  ): Promise<TenantAccessAggregate | null> {
    const { data: tenant } = await this.tenantReadRepo.findById(
      tenantUser.tenantId,
    );

    const isTenantActive = tenant && tenant.status === TenantStatus.ACTIVE;

    if (!isTenantActive) return null;

    const tenantAccess = AuthenticateUserResultMapper.toTenantAccessDto(
      tenantUser,
      tenant ?? null,
    );

    if (!tenantAccess) return null;

    return {
      tenantAccess,
      claim: AuthTokenMapper.buildTenantClaim(tenantAccess),
    };
  }
}
