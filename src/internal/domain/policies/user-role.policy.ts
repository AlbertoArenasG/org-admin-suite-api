import { UserRole } from '@domain/entities';
import { AuthorizationException } from '@domain/exceptions';

const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.MASTER_ADMIN]: 0,
  [UserRole.MASTER_STAFF]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.STAFF]: 3,
  [UserRole.CUSTOMER]: 4,
};

function canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
  if (actorRole === UserRole.MASTER_ADMIN) {
    return true;
  }

  if (actorRole === UserRole.CUSTOMER) {
    return false;
  }

  return ROLE_RANK[actorRole] <= ROLE_RANK[targetRole];
}

export const UserRolePolicy = {
  ensureCanManageRole(actorRole: UserRole, targetRole: UserRole): void {
    if (!canManageRole(actorRole, targetRole)) {
      throw AuthorizationException.rolePrivilegesInsufficient(actorRole);
    }
  },
};
