import { Injectable } from '@nestjs/common';
import { ConvertServicePackageRecordResultDto } from '@application/dto';

@Injectable()
export class ServicePackageRecordConversionPresenter {
  toResponse(result: ConvertServicePackageRecordResultDto) {
    return {
      source_record_id: result.sourceRecordId,
      service_order: result.serviceOrder,
      records: result.records.map((item) => ({
        equipment_index: item.equipmentIndex,
        customer_service_record_id: item.customerServiceRecordId,
        service_number: item.serviceNumber,
        service_number_display: item.serviceNumberDisplay,
      })),
    };
  }
}
