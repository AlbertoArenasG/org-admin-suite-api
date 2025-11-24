export interface IngestServicePackageDto {
  filename: string | null;
  buffer: Buffer;
}

export interface ParsedServicePackageDetailsDto {
  serviceNumber: string;
  serviceTime: string | null;
  company: string | null;
  collectorName: string | null;
  contactPerson: string | null;
  visitDate: string | null;
  serviceType: string | null;
  purpose: string | null;
  email: string | null;
  address: string | null;
  phone: string | null;
  equipment: ServicePackageEquipmentDto[];
  observations: string | null;
  createdAt: Date | null;
  synced: boolean;
  hasCollectorSignature: boolean;
  hasClientSignature: boolean;
  raw: Record<string, unknown>;
}

export interface ServicePackageEquipmentDto {
  number: number | null;
  equipment: string | null;
  brand: string | null;
  model: string | null;
  identification: string | null;
  serialNumber: string | null;
}

export interface IngestedServicePackageRecordDto {
  recordId: string;
  serviceOrder: string;
  fileCount: number;
}

export interface IngestServicePackageResultDto {
  packageId: string;
  services: IngestedServicePackageRecordDto[];
}
