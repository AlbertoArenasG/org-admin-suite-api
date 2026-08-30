import { genId } from '@src/common/utils';
import { Entity } from '@src/internal/core/entities/entity';

export enum CustomerServiceRecordServiceTypeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface CustomerServiceRecordServiceTypeProps {
  id?: string;
  code: string;
  name: string;
  status?: CustomerServiceRecordServiceTypeStatus;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CustomerServiceRecordServiceType extends Entity<CustomerServiceRecordServiceTypeProps> {
  constructor(props: CustomerServiceRecordServiceTypeProps) {
    props.id = props.id ?? genId();
    props.status =
      props.status ?? CustomerServiceRecordServiceTypeStatus.ACTIVE;
    props.createdBy = props.createdBy ?? null;
    props.updatedBy = props.updatedBy ?? null;
    super(props);
  }

  get id(): string {
    return this.props.id!;
  }
  get code(): string {
    return this.props.code;
  }
  get name(): string {
    return this.props.name;
  }
  get status(): CustomerServiceRecordServiceTypeStatus {
    return this.props.status ?? CustomerServiceRecordServiceTypeStatus.ACTIVE;
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
  get currentState(): CustomerServiceRecordServiceTypeProps {
    return this.props;
  }

  updateStatus(
    status: CustomerServiceRecordServiceTypeStatus,
    updatedBy?: string | null,
  ): void {
    this.props.status = status;
    if (updatedBy !== undefined) this.props.updatedBy = updatedBy;
    this.props.updatedAt = new Date();
  }
}
