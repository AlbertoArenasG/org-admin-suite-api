import { IsEnum } from 'class-validator';

import { UpdateCustomerServiceRecordServiceTypeDto } from '@application/dto';
import { CustomerServiceRecordServiceTypeStatus } from '@domain/entities';

export class UpdateCustomerServiceRecordServiceTypeRequestDto {
  @IsEnum(CustomerServiceRecordServiceTypeStatus)
  status!: CustomerServiceRecordServiceTypeStatus;

  toDomain(
    serviceTypeId: string,
    actorUserId: string,
  ): UpdateCustomerServiceRecordServiceTypeDto {
    return { serviceTypeId, actorUserId, status: this.status };
  }
}
