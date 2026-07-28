import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { Role, RoleStatus } from '@domain/entities';

export class RoleMutationPolicy {
  static ensureExists(role: Role | null, roleId: string): Role {
    if (!role || role.status === RoleStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.ROLE, {
        roleId,
      });
    }

    return role;
  }

  static ensureMutable(role: Role): void {
    if (role.isSystem || role.isImmutable || role.isDefault) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'role',
        reason: 'IMMUTABLE_ROLE',
        roleId: role.id,
      });
    }
  }
}
