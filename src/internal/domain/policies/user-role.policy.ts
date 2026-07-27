import { SystemRole, User, UserRole } from '@domain/entities';
import { AuthorizationException } from '@domain/exceptions';

const ROLE_RANK: Record<SystemRole, number> = {
  [SystemRole.MASTER_ADMIN]: 0,
  [SystemRole.ADMIN]: 1,
  [SystemRole.USER]: 2,
};

function toSystemRole(role: UserRole | SystemRole): SystemRole {
  if (Object.values(SystemRole).includes(role as SystemRole)) {
    return role as SystemRole;
  }

  return User.resolveSystemRoleFromLegacyRole(role as UserRole);
}

function canManageRole(
  actorRole: UserRole | SystemRole,
  targetRole: UserRole | SystemRole,
): boolean {
  const actorSystemRole = toSystemRole(actorRole);
  const targetSystemRole = toSystemRole(targetRole);

  if (actorSystemRole === SystemRole.MASTER_ADMIN) {
    return true;
  }

  if (actorSystemRole === SystemRole.USER) {
    return false;
  }

  return ROLE_RANK[actorSystemRole] <= ROLE_RANK[targetSystemRole];
}

export const UserRolePolicy = {
  ensureCanManageRole(
    actorRole: UserRole | SystemRole,
    targetRole: UserRole | SystemRole,
  ): void {
    if (!canManageRole(actorRole, targetRole)) {
      throw AuthorizationException.rolePrivilegesInsufficient(actorRole);
    }
  },
  ensureHasHigherPrivileges(
    actorRole: UserRole | SystemRole,
    targetRole: UserRole | SystemRole,
  ): void {
    const actorSystemRole = toSystemRole(actorRole);
    const targetSystemRole = toSystemRole(targetRole);

    if (ROLE_RANK[actorSystemRole] >= ROLE_RANK[targetSystemRole]) {
      throw AuthorizationException.rolePrivilegesInsufficient(actorRole);
    }
  },
};
