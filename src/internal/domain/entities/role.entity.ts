import { genId } from '@src/common/utils';
import { Entity } from '@src/internal/core/entities/entity';

import { InvalidValueException } from '@domain/exceptions';

export interface RolePermissionProps {
  module: string;
  operation: string;
}

export interface RoleProps {
  id?: string;
  name: string;
  code: string;
  scope: RoleScope;
  isSystem: boolean;
  isImmutable: boolean;
  isDefault: boolean;
  status?: RoleStatus;
  permissions?: RolePermissionProps[];
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum SystemRole {
  MASTER_ADMIN = 'MASTER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum RoleScope {
  MASTER_ADMIN = 'MASTER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum RoleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export enum CatalogStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class Role extends Entity<RoleProps> {
  constructor(props: RoleProps) {
    props.id = props.id ?? genId();
    props.status = props.status ?? RoleStatus.ACTIVE;
    props.permissions = Role.ensureUniquePermissions(props.permissions ?? []);
    props.createdBy = props.createdBy ?? null;
    props.updatedBy = props.updatedBy ?? null;

    Role.ensureModelConsistency(props);
    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get name(): string {
    return this.props.name;
  }

  get code(): string {
    return this.props.code;
  }

  get scope(): RoleScope {
    return this.props.scope;
  }

  get isSystem(): boolean {
    return this.props.isSystem;
  }

  get isImmutable(): boolean {
    return this.props.isImmutable;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  get status(): RoleStatus {
    return this.props.status ?? RoleStatus.ACTIVE;
  }

  get permissions(): RolePermissionProps[] {
    return [...(this.props.permissions ?? [])];
  }

  get createdBy(): string | null {
    return this.props.createdBy ?? null;
  }

  get updatedBy(): string | null {
    return this.props.updatedBy ?? null;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get currentState(): RoleProps {
    return this.props;
  }

  activate(updatedBy?: string | null): void {
    this.props.status = RoleStatus.ACTIVE;
    this.touch(updatedBy);
  }

  deactivate(updatedBy?: string | null): void {
    this.props.status = RoleStatus.INACTIVE;
    this.touch(updatedBy);
  }

  markAsDeleted(updatedBy?: string | null): void {
    this.props.status = RoleStatus.DELETED;
    this.touch(updatedBy);
  }

  replacePermissions(
    permissions: RolePermissionProps[],
    updatedBy?: string | null,
  ): void {
    this.props.permissions = Role.ensureUniquePermissions(permissions);
    this.touch(updatedBy);
  }

  private touch(updatedBy?: string | null): void {
    if (updatedBy !== undefined) {
      this.props.updatedBy = updatedBy;
    }

    this.props.updatedAt = new Date();
  }

  private static ensureModelConsistency(props: RoleProps): void {
    if (!props.isSystem && props.scope !== RoleScope.USER) {
      throw InvalidValueException.create(undefined, {
        message: 'Custom roles must use USER scope',
        scope: props.scope,
      });
    }

    if (props.isDefault && !props.isSystem) {
      throw InvalidValueException.create(undefined, {
        message: 'Default roles must be system roles',
        code: props.code,
      });
    }

    if (props.isDefault && !props.isImmutable) {
      throw InvalidValueException.create(undefined, {
        message: 'Default roles must be immutable',
        code: props.code,
      });
    }
  }

  private static ensureUniquePermissions(
    permissions: RolePermissionProps[],
  ): RolePermissionProps[] {
    const seen = new Set<string>();

    return permissions.map((permission) => {
      const key = `${permission.module}:${permission.operation}`;
      if (seen.has(key)) {
        throw InvalidValueException.create(undefined, {
          message: 'Duplicated role permission',
          module: permission.module,
          operation: permission.operation,
        });
      }

      seen.add(key);
      return permission;
    });
  }
}
