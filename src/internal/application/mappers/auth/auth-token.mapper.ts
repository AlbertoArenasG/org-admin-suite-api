import { TenantUser, User } from '@domain/entities';
import {
  MasterTokenPayloadDto,
  TenantAccessTokenPayloadDto,
} from '@application/dto';

export class AuthTokenMapper {
  static toMasterPayload(user: User): MasterTokenPayloadDto {
    return {
      sub: user.id!,
      role: user.role,
    };
  }

  static toTenantPayload(
    user: User,
    tenantUser: TenantUser,
  ): TenantAccessTokenPayloadDto {
    return {
      sub: user.id!,
      tenant_id: tenantUser.tenantId,
      tenant_user_id: tenantUser.id!,
      role: tenantUser.role,
    };
  }
}
