import { TenantUserRole, UserRole } from '@domain/entities';

export enum AuthenticatedActorType {
  MASTER = 'MASTER',
  TENANT = 'TENANT',
}

export interface AuthenticatedMasterDto {
  type: AuthenticatedActorType.MASTER;
  userId: string;
  role: UserRole;
  token: string;
}

export interface AuthenticatedTenantDto {
  type: AuthenticatedActorType.TENANT;
  userId: string;
  tenantId: string;
  tenantUserId: string;
  role: TenantUserRole;
  token: string;
}

export type AuthenticatedActorDto =
  | AuthenticatedMasterDto
  | AuthenticatedTenantDto;

export const AuthenticatedActor = {
  isMaster(actor: AuthenticatedActorDto): actor is AuthenticatedMasterDto {
    return actor.type === AuthenticatedActorType.MASTER;
  },
  isTenant(actor: AuthenticatedActorDto): actor is AuthenticatedTenantDto {
    return actor.type === AuthenticatedActorType.TENANT;
  },
};
