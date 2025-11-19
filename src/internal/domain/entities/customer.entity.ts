import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';
export interface CustomerProps {
  id?: string;
  companyName: string;
  clientCode: string;
  accessToken: string;
  status?: CustomerStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class Customer extends Entity<CustomerProps> {
  constructor(props: CustomerProps) {
    if (!props.id) {
      props.id = genId();
    }

    props.status = props.status ?? CustomerStatus.ACTIVE;
    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get companyName(): string {
    return this.props.companyName;
  }

  get clientCode(): string {
    return this.props.clientCode;
  }

  get accessToken(): string | null {
    return this.props.accessToken ?? null;
  }

  get status(): CustomerStatus {
    return this.props.status ?? CustomerStatus.ACTIVE;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  activate(): void {
    this.props.status = CustomerStatus.ACTIVE;
    this.touch();
  }

  deactivate(): void {
    this.props.status = CustomerStatus.INACTIVE;
    this.touch();
  }

  markAsDeleted(): void {
    this.props.status = CustomerStatus.DELETED;
    this.touch();
  }

  updateAccessToken(token: string): void {
    this.props.accessToken = token;
    this.touch();
  }

  updateDetails(details: { companyName?: string; clientCode?: string }): void {
    if (details.companyName !== undefined) {
      this.props.companyName = details.companyName;
    }

    if (details.clientCode !== undefined) {
      this.props.clientCode = details.clientCode;
    }

    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
