import { User } from '@domain/entities';
import {
  AuthenticatedUserDto,
  CreateMasterUserResultDto,
  CreateUserResultDto,
  UserViewDto,
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
      systemRole: user.systemRole,
      roleId: user.roleId,
      status: user.status,
      cellPhone: toCellPhoneDto(user),
    };
  }

  static toUserViewDto(
    user: User,
    roleName: string | null = null,
  ): UserViewDto {
    return {
      id: user.id!,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      systemRole: user.systemRole,
      roleId: user.roleId,
      roleName,
      status: user.status,
      cellPhone: toCellPhoneDto(user),
      createdAt: user.createdAt ?? new Date(),
    };
  }

  static toUserViewCollection(
    users: User[],
    roleNamesByRoleId: Map<string, string> = new Map(),
  ): UserViewDto[] {
    return users.map((user) =>
      this.toUserViewDto(
        user,
        user.roleId ? (roleNamesByRoleId.get(user.roleId) ?? null) : null,
      ),
    );
  }

  static toCreateMasterUserResultDto(
    user: User,
    roleName: string | null = null,
  ): CreateMasterUserResultDto {
    return this.toUserViewDto(user, roleName);
  }

  static toCreateUserResultDto(
    user: User,
    roleName: string | null = null,
  ): CreateUserResultDto {
    return this.toUserViewDto(user, roleName);
  }
}
