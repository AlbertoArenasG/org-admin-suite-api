import { Entity } from '@src/internal/core/entities/entity';
import { EntityCreatedEvent } from '@domain/events';
import { CellPhone } from '../value-objects';

export interface UserProps {
  id?: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  cellPhone: CellPhone;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  constructor(props: UserProps) {
    super(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get lastname(): string {
    return this.props.lastname;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get cellPhone(): CellPhone {
    return this.props.cellPhone;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get currentState(): UserProps {
    return this.props;
  }

  get hasCellPhone(): boolean {
    return !this.cellPhone.isNull();
  }

  markAsCreated(): void {
    this.apply(new EntityCreatedEvent(this));
  }
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT',
}
