import { UserStatus, TenantUserRole } from '@src/internal/domain/entities';
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
  name: string;
  lastname: string;
  email: string;
  role: TenantUserRole;
  status: UserStatus;
  cellPhone: PhoneDto;
  createdAt: Date;
}
