import { CustomerStatus, SystemRole, UserStatus } from '@domain/entities';
import { PhoneDto } from '@application/dto/shared';

export interface CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  systemRole: SystemRole;
  roleId: string | null;
  isInternalStaff?: boolean;
  cellPhone: PhoneDto;
}

export interface UserViewDto {
  id: string;
  name: string;
  lastname: string;
  email: string;
  systemRole: SystemRole;
  roleId: string | null;
  isInternalStaff: boolean;
  roleName: string | null;
  status: UserStatus;
  cellPhone: PhoneDto;
  createdAt: Date;
  customers?: UserCustomerViewDto[];
}

export interface UserCustomerViewDto {
  id: string;
  companyName: string;
  status: CustomerStatus;
}

export type CreateUserResultDto = UserViewDto;
