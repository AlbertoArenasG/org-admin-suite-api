import {
  CustomerServiceRecordAssetInputDto,
  CustomerServiceRecordCustomerInputDto,
} from '@application/dto/customer-service-record';

export interface ConvertServicePackageRecordItemDto {
  equipmentIndex: number;
  customer: CustomerServiceRecordCustomerInputDto;
  serviceTypeCode: string;
  requestedAt: string;
  receivedAt?: string | null;
  asset: CustomerServiceRecordAssetInputDto;
  photoFileIds: string[];
}

export interface ConvertServicePackageRecordDto {
  sourceRecordId: string;
  actorUserId: string;
  records: ConvertServicePackageRecordItemDto[];
}

export interface ConvertServicePackageRecordResultDto {
  sourceRecordId: string;
  serviceOrder: string;
  records: Array<{
    equipmentIndex: number;
    customerServiceRecordId: string;
    serviceNumber: number;
    serviceNumberDisplay: string;
  }>;
}
