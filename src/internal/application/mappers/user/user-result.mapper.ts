import { User } from '@domain/entities';
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

  static toCreateUserResultDto(user: User): CreateUserResultDto {
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
}
