import { Entity } from '@src/internal/core/entities/entity';
import { EntityCreatedEvent } from '@domain/events';
import { SystemRole } from './role.entity';
import { Phone } from '../value-objects';

export interface UserProps {
  id?: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  systemRole: SystemRole;
  roleId: string | null;
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

    props.roleId = props.roleId ?? null;

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

  get systemRole(): SystemRole {
    return this.props.systemRole;
  }

  get roleId(): string | null {
    return this.props.roleId ?? null;
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

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static isMasterSystemRole(systemRole: SystemRole): boolean {
    return systemRole === SystemRole.MASTER_ADMIN;
  }

  updateDetails(details: {
    name?: string;
    lastname?: string;
    email?: string;
    cellPhone?: {
      countryCode: string | null;
      number: string | null;
    } | null;
  }): void {
    if (details.name !== undefined) {
      this.props.name = details.name;
    }

    if (details.lastname !== undefined) {
      this.props.lastname = details.lastname;
    }

    if (details.email !== undefined) {
      this.props.email = details.email;
    }

    if (details.cellPhone !== undefined) {
      const phone =
        details.cellPhone !== null
          ? new Phone(details.cellPhone)
          : new Phone({ countryCode: null, number: null });
      this.props.cellPhone = phone;
    }

    this.touch();
  }

  updateAuthorization(params: {
    systemRole: SystemRole;
    roleId: string | null;
  }): void {
    this.props.systemRole = params.systemRole;
    this.props.roleId = params.roleId;
    this.touch();
  }

  updateStatus(status: UserStatus): void {
    this.props.status = status;
    this.touch();
  }

  updatePassword(password: string): void {
    this.props.password = password;
    this.touch();
  }

  markAsDeleted(): void {
    this.props.status = UserStatus.DELETED;
    this.touch();
  }
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}
