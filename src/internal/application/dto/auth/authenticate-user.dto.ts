import {
  TenantStatus,
  TenantUserRole,
  TenantUserStatus,
  UserRole,
  UserStatus,
} from '@domain/entities';
import { PhoneDto } from '@application/dto/shared';

export interface AuthenticateUserDto {
  email: string;
  password: string;
}

export interface AuthenticatedUserDto {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  cellPhone: PhoneDto;
}

export interface AuthenticatedTenantAccessDto {
  tenantUserId: string;
  tenantId: string;
  role: TenantUserRole;
  status: TenantUserStatus;
  tenant?: {
    id: string;
    name: string;
    slug: string;
    status: TenantStatus;
  } | null;
}

export interface AuthenticateUserResultDto {
  user: AuthenticatedUserDto;
  accessToken: string;
  tenants: AuthenticatedTenantAccessDto[];
  defaultTenantId?: string | null;
}
