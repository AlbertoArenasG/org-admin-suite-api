import { IsOptional, IsString } from 'class-validator';

import { PaginationRequestDto } from '@infra/api/dto/shared';
import { GetServicePackageRecordsDto } from '@application/dto';

export class GetServicePackageRecordsRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsString()
  package_id?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  service_type?: string;

  toDomain(): GetServicePackageRecordsDto {
    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      packageId: this.package_id ?? null,
      search: this.search ?? null,
      serviceType: this.service_type ?? null,
    };
  }
}
