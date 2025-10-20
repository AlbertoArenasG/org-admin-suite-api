import { TenantUser, TenantUserRole, TenantUserStatus } from '@domain/entities';
import { TenantUserDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseTenantUserMapper {
  static toDomain(document: TenantUserDocument): TenantUser | null {
    if (!document) return null;

    return new TenantUser({
      id: document.tenant_user_id,
      tenantId: document.tenant_id,
      userId: document.user_id,
      role: document.role as TenantUserRole,
      status: document.status as TenantUserStatus,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  static toMongoose(tenantUser: TenantUser) {
    return {
      ...(tenantUser.id ? { tenant_user_id: tenantUser.id } : {}),
      tenant_id: tenantUser.tenantId,
      user_id: tenantUser.userId,
      role: tenantUser.role,
      status: tenantUser.status,
    };
  }
}
