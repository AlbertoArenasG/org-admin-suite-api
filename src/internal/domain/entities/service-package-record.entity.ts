import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export interface ServicePackageRecordFileProps {
  id?: string;
  relativePath: string;
  originalName: string;
  s3Key: string;
  size: number;
  contentType: string;
}

export interface ServicePackageRecordProps {
  id?: string;
  packageId: string;
  serviceOrder: string;
  originalFilename?: string | null;
  s3FolderKey: string;
  details: Record<string, unknown>;
  company?: string | null;
  collectorName?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  visitDate?: string | null;
  serviceType?: string | null;
  purpose?: string | null;
  files: ServicePackageRecordFileProps[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class ServicePackageRecord extends Entity<ServicePackageRecordProps> {
  constructor(props: ServicePackageRecordProps) {
    props.id = props.id ?? genId();
    props.originalFilename = props.originalFilename ?? null;
    props.company = props.company ?? null;
    props.collectorName = props.collectorName ?? null;
    props.contactPerson = props.contactPerson ?? null;
    props.email = props.email ?? null;
    props.phone = props.phone ?? null;
    props.address = props.address ?? null;
    props.visitDate = props.visitDate ?? null;
    props.serviceType = props.serviceType ?? null;
    props.purpose = props.purpose ?? null;
    props.files = props.files ?? [];
    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get packageId(): string {
    return this.props.packageId;
  }

  get serviceOrder(): string {
    return this.props.serviceOrder;
  }

  get originalFilename(): string | null {
    return this.props.originalFilename ?? null;
  }

  get s3FolderKey(): string {
    return this.props.s3FolderKey;
  }

  get details(): Record<string, unknown> {
    return this.props.details;
  }

  get company(): string | null {
    return this.props.company ?? null;
  }

  get collectorName(): string | null {
    return this.props.collectorName ?? null;
  }

  get contactPerson(): string | null {
    return this.props.contactPerson ?? null;
  }

  get email(): string | null {
    return this.props.email ?? null;
  }

  get phone(): string | null {
    return this.props.phone ?? null;
  }

  get address(): string | null {
    return this.props.address ?? null;
  }

  get visitDate(): string | null {
    return this.props.visitDate ?? null;
  }

  get serviceType(): string | null {
    return this.props.serviceType ?? null;
  }

  get purpose(): string | null {
    return this.props.purpose ?? null;
  }

  get files(): ServicePackageRecordFileProps[] {
    return this.props.files;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
