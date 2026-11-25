import { CustomerServiceRecordClientAccessTimelineViewDto } from '@application/dto';
import { formatCustomerServiceRecordServiceNumber } from '@domain/entities';
import { CustomerServiceRecordClientAccessTimelineReadModel } from '@domain/ports/repositories';

export class CustomerServiceRecordClientAccessTimelineMapper {
  static toViewDto(
    record: CustomerServiceRecordClientAccessTimelineReadModel,
  ): CustomerServiceRecordClientAccessTimelineViewDto {
    return {
      id: record.id,
      serviceNumber: record.serviceNumber,
      serviceNumberDisplay: formatCustomerServiceRecordServiceNumber(
        record.serviceNumber,
      ),
      serviceType: {
        code: record.serviceTypeCode,
        name: record.serviceTypeName,
      },
      requestedAt: record.requestedAt,
      customer: record.customer,
      assets: record.assets,
      operationalStatus: record.operationalStatus,
      customerDelivery: record.customerDelivery,
    };
  }
}
