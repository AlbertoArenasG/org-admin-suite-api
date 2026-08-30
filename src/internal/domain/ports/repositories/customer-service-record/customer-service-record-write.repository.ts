import {
  CustomerServiceRecord,
  CustomerServiceRecordNotificationMaterializationProps,
  CustomerServiceRecordProviderFollowUpMaterializationProps,
  CustomerServiceRecordStatusMaterializationProps,
} from '@domain/entities';

export interface UpdateCustomerServiceRecordMaterializationsParams {
  recordId: string;
  customerDelivery?: {
    statusMaterialization?: CustomerServiceRecordStatusMaterializationProps | null;
    notificationMaterialization?: CustomerServiceRecordNotificationMaterializationProps | null;
  };
  provider?: {
    statusMaterialization?: CustomerServiceRecordStatusMaterializationProps | null;
    notificationMaterialization?: CustomerServiceRecordNotificationMaterializationProps | null;
    followUpMaterialization?: CustomerServiceRecordProviderFollowUpMaterializationProps[];
  };
}

export interface ICustomerServiceRecordWriteRepository {
  create(
    record: CustomerServiceRecord,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  update(
    record: CustomerServiceRecord,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  updateMaterializations(
    params: UpdateCustomerServiceRecordMaterializationsParams,
  ): Promise<{ updated: boolean }>;
}

export const ICustomerServiceRecordWriteRepositoryToken = Symbol(
  'ICustomerServiceRecordWriteRepository',
);
