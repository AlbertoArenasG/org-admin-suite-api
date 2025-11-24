import { Injectable } from '@nestjs/common';

import { IngestServicePackageResultDto } from '@application/dto';

@Injectable()
export class ServicePackagePresenter {
  toIngestResponse(result: IngestServicePackageResultDto) {
    return {
      package_id: result.packageId,
      services: result.services.map((service) => ({
        record_id: service.recordId,
        service_order: service.serviceOrder,
        file_count: service.fileCount,
      })),
    };
  }
}
