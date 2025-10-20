import { Entity } from '@src/internal/core/entities/entity';
import { EntityCreatedEvent } from '@domain/events';

export interface TenantUserProps {
  id?: string;
  tenantId: string;
  userId: string;
  role: TenantUserRole;
  status: TenantUserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TenantUser extends Entity<TenantUserProps> {
  constructor(props: TenantUserProps) {
    super(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): TenantUserRole {
    return this.props.role;
  }

  get status(): TenantUserStatus {
    return this.props.status;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get currentState(): TenantUserProps {
    return this.props;
  }

  changeRole(role: TenantUserRole): void {
    this.props.role = role;
  }

  changeStatus(status: TenantUserStatus): void {
    this.props.status = status;
  }

  markAsCreated(): void {
    this.apply(new EntityCreatedEvent(this));
  }
}

export enum TenantUserRole {
  TENANT_ADMIN = 'TENANT_ADMIN',
  TENANT_STAFF = 'TENANT_STAFF',
  TENANT_CLIENT = 'TENANT_CLIENT',
}

export enum TenantUserStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}
