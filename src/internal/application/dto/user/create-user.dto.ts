import { TenantUserStatus, TenantUserRole } from '@domain/entities';
import { PhoneDto } from '@application/dto/shared';

export interface CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  tenantId: string;
  role: TenantUserRole;
  cellPhone: PhoneDto;
}

export interface CreateUserResultDto {
  id: string;
  userTenantId: string;
  tenantId: string;
  name: string;
  lastname: string;
  email: string;
  role: TenantUserRole;
  status: TenantUserStatus;
  cellPhone: PhoneDto;
  createdAt: Date;
}
