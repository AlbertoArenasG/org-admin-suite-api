import { CustomerServiceRecordServiceType } from '@domain/entities';
import { CustomerServiceRecordServiceTypeDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseCustomerServiceRecordServiceTypeMapper {
  static toDomain(
    document: CustomerServiceRecordServiceTypeDocument | null,
  ): CustomerServiceRecordServiceType | null {
    if (!document) return null;
    const value = document as any;
    return new CustomerServiceRecordServiceType({
      id: value.customer_service_record_service_type_id,
      code: value.code,
      name: value.name,
      status: value.status,
      createdBy: value.created_by ?? null,
      updatedBy: value.updated_by ?? null,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }

  static toMongoose(serviceType: CustomerServiceRecordServiceType) {
    return {
      code: serviceType.code,
      name: serviceType.name,
      status: serviceType.status,
      created_by: serviceType.createdBy,
      updated_by: serviceType.updatedBy,
      createdAt: serviceType.createdAt,
      updatedAt: serviceType.updatedAt,
    };
  }
}
