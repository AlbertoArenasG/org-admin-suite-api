import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export enum ServiceEntryCategory {
  ANALYSIS = 'ANALYSIS',
  CALIBRATION = 'CALIBRATION',
  EQUIPMENT_DELIVERY = 'EQUIPMENT_DELIVERY',
  MACHINING = 'MACHINING',
  CORRECTIVE_MAINTENANCE = 'CORRECTIVE_MAINTENANCE',
  PREVENTIVE_MAINTENANCE = 'PREVENTIVE_MAINTENANCE',
  CALIBRATION_COLLECTION = 'CALIBRATION_COLLECTION',
  ON_SITE_SERVICE = 'ON_SITE_SERVICE',
}

export interface ServiceEntryProps {
  id?: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  serviceOrderIdentifier: string;
  category: ServiceEntryCategory;
  calibrationCertificateFileId: string;
  attachmentFileIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class ServiceEntry extends Entity<ServiceEntryProps> {
  constructor(props: ServiceEntryProps) {
    if (!props.id) {
      props.id = genId();
    }

    if (!props.attachmentFileIds) {
      props.attachmentFileIds = [];
    }

    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get companyName(): string {
    return this.props.companyName;
  }

  get contactName(): string {
    return this.props.contactName;
  }

  get contactEmail(): string {
    return this.props.contactEmail;
  }

  get serviceOrderIdentifier(): string {
    return this.props.serviceOrderIdentifier;
  }

  get category(): ServiceEntryCategory {
    return this.props.category;
  }

  get calibrationCertificateFileId(): string {
    return this.props.calibrationCertificateFileId;
  }

  get attachmentFileIds(): string[] {
    return this.props.attachmentFileIds;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
