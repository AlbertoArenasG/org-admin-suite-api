import { Entity } from '@src/internal/core/entities/entity';
import { EntityCreatedEvent } from '@domain/events';
import { Phone } from '../value-objects';

export interface UserProps {
  id?: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  cellPhone: {
    countryCode: string | null;
    number: string | null;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  constructor(props: UserProps) {
    if (props.cellPhone) {
      const cellPhone = new Phone(props.cellPhone);
      props.cellPhone = cellPhone;
    }
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

  get cellPhone(): Phone {
    return {
      countryCode: this.props.cellPhone?.countryCode,
      number: this.props.cellPhone?.number,
    } as Phone;
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
    return !this.cellPhone.isNull;
  }

  get fullName(): string {
    return `${this.name} ${this.lastname}`;
  }

  markAsCreated(): void {
    this.apply(new EntityCreatedEvent(this));
  }

  get isMaster(): boolean {
    return User.isMasterRole(this.role);
  }

  static isMasterRole(role: UserRole): boolean {
    return role === UserRole.MASTER_ADMIN || role === UserRole.MASTER_STAFF;
  }

  updateRole(role: UserRole): void {
    this.props.role = role;
  }
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export enum UserRole {
  MASTER_ADMIN = 'MASTER_ADMIN',
  MASTER_STAFF = 'MASTER_STAFF',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}
