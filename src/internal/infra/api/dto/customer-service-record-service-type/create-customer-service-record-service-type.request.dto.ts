import { IsNotEmpty, IsString } from 'class-validator';

import { CreateCustomerServiceRecordServiceTypeDto } from '@application/dto';

export class CreateCustomerServiceRecordServiceTypeRequestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  toDomain(actorUserId: string): CreateCustomerServiceRecordServiceTypeDto {
    return { actorUserId, name: this.name };
  }
}
