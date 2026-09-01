import {
  ServicePackageRecordFileProps,
  ServicePackageRecordStatus,
} from '@domain/entities';

export interface ServicePackageRecordFileDto {
  fileId: string;
  relativePath: string;
  originalName: string;
  s3Key: string;
  size: number;
  contentType: string;
}

export interface ServicePackageRecordViewDto {
  id: string;
  packageId: string;
  serviceOrder: string;
  originalFilename: string | null;
  s3FolderKey: string;
  details: Record<string, unknown>;
  company: string | null;
  collectorName: string | null;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  visitDate: string | null;
  serviceType: string | null;
  purpose: string | null;
  files: ServicePackageRecordFileDto[];
  status: ServicePackageRecordStatus;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

export interface GetServicePackageRecordsDto {
  page: number;
  perPage: number;
  packageId?: string | null;
  search?: string | null;
  serviceType?: string | null;
}

export interface GetServicePackageRecordsResultDto {
  items: ServicePackageRecordViewDto[];
  page: number;
  perPage: number;
  total: number;
}

export interface ServicePackageRecordServiceTypeOptionDto {
  value: string;
  label: string;
}

export type GetServicePackageRecordServiceTypeOptionsResultDto =
  ServicePackageRecordServiceTypeOptionDto[];

export interface DeleteServicePackageRecordDto {
  recordId: string;
}

export function mapFilePropsToDto(
  file: ServicePackageRecordFileProps,
): ServicePackageRecordFileDto {
  return {
    fileId: file.id ?? file.s3Key,
    relativePath: file.relativePath,
    originalName: file.originalName,
    s3Key: file.s3Key,
    size: file.size,
    contentType: file.contentType,
  };
}
