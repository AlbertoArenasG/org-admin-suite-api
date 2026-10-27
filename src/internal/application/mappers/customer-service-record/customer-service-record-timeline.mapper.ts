import { CustomerServiceRecordTimelineViewDto } from '@application/dto';
import { formatCustomerServiceRecordServiceNumber } from '@domain/entities';
import { CustomerServiceRecordTimelineReadModel } from '@domain/ports/repositories';

export class CustomerServiceRecordTimelineMapper {
  static toViewDto(
    record: CustomerServiceRecordTimelineReadModel,
  ): CustomerServiceRecordTimelineViewDto {
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
      provider: record.provider,
    };
  }
}
