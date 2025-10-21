import { TenantUser, User } from '@domain/entities';
import {
  AuthenticatedUserDto,
  CreateMasterUserResultDto,
  CreateUserResultDto,
} from '@application/dto';

function toCellPhoneDto(user: User) {
  return {
    countryCode: user.cellPhone?.countryCode ?? null,
    number: user.cellPhone?.number ?? null,
  };
}

export class UserResultMapper {
  static toAuthenticatedUserDto(user: User): AuthenticatedUserDto {
    return {
      id: user.id!,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      status: user.status,
      cellPhone: toCellPhoneDto(user),
    };
  }

  static toCreateMasterUserResultDto(user: User): CreateMasterUserResultDto {
    return {
      id: user.id!,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      status: user.status,
      cellPhone: toCellPhoneDto(user),
      createdAt: user.createdAt ?? new Date(),
    };
  }

  static toCreateTenantUserResultDto(
    user: User,
    tenantUser: TenantUser,
  ): CreateUserResultDto {
    return {
      id: user.id!,
      userTenantId: tenantUser.id!,
      tenantId: tenantUser.tenantId,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      role: tenantUser.role,
      status: tenantUser.status,
      cellPhone: toCellPhoneDto(user),
      createdAt: user.createdAt ?? new Date(),
    };
  }
}
