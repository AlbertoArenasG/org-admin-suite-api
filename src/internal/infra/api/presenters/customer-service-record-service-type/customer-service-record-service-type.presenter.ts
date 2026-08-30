import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecordServiceTypeDto,
  CustomerServiceRecordServiceTypeOptionDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class CustomerServiceRecordServiceTypePresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toResponse(result: CustomerServiceRecordServiceTypeDto) {
    return {
      customer_service_record_service_type_id: result.id,
      code: result.code,
      name: result.name,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `CUSTOMER_SERVICE_RECORD_SERVICE_TYPE.STATUS.${result.status}`,
      ),
      created_at: result.createdAt,
      updated_at: result.updatedAt ?? null,
    };
  }

  toCollection(results: CustomerServiceRecordServiceTypeDto[]) {
    return results.map((result) => this.toResponse(result));
  }

  toOptionsResponse(results: CustomerServiceRecordServiceTypeOptionDto[]) {
    return results.map((result) => ({ code: result.code, name: result.name }));
  }
}
