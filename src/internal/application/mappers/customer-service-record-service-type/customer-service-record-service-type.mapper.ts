import {
  CustomerServiceRecordServiceTypeDto,
  CustomerServiceRecordServiceTypeOptionDto,
} from '@application/dto';
import { CustomerServiceRecordServiceType } from '@domain/entities';

export class CustomerServiceRecordServiceTypeMapper {
  static toDto(
    serviceType: CustomerServiceRecordServiceType,
  ): CustomerServiceRecordServiceTypeDto {
    return {
      id: serviceType.id,
      code: serviceType.code,
      name: serviceType.name,
      status: serviceType.status,
      createdAt: serviceType.createdAt ?? new Date(),
      updatedAt: serviceType.updatedAt,
    };
  }

  static toOptionDto(
    serviceType: CustomerServiceRecordServiceType,
  ): CustomerServiceRecordServiceTypeOptionDto {
    return { code: serviceType.code, name: serviceType.name };
  }
}
