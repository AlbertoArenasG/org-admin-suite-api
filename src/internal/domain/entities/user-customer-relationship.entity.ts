import { genId } from '@src/common/utils';
import { Entity } from '@src/internal/core/entities/entity';

export interface UserCustomerRelationshipProps {
  id?: string;
  userId: string;
  customerId: string;
}

export class UserCustomerRelationship extends Entity<UserCustomerRelationshipProps> {
  constructor(props: UserCustomerRelationshipProps) {
    if (!props.id) {
      props.id = genId();
    }

    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get userId(): string {
    return this.props.userId;
  }

  get customerId(): string {
    return this.props.customerId;
  }
}
