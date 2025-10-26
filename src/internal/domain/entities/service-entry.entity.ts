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
  status?: ServiceEntryStatus;
  surveyAccessId?: string | null;
  surveyTemplateId?: string | null;
  surveyTemplateVersion?: number | null;
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

    if (!props.status) {
      props.status = ServiceEntryStatus.ACTIVE;
    }

    props.surveyAccessId = props.surveyAccessId ?? null;
    props.surveyTemplateId = props.surveyTemplateId ?? null;
    props.surveyTemplateVersion = props.surveyTemplateVersion ?? null;

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

  get status(): ServiceEntryStatus {
    return this.props.status ?? ServiceEntryStatus.ACTIVE;
  }

  get surveyAccessId(): string | null {
    return this.props.surveyAccessId ?? null;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get surveyTemplateId(): string | null {
    return this.props.surveyTemplateId ?? null;
  }

  get surveyTemplateVersion(): number | null {
    return this.props.surveyTemplateVersion ?? null;
  }

  updateDetails(details: {
    companyName?: string;
    contactName?: string;
    contactEmail?: string;
    serviceOrderIdentifier?: string;
    category?: ServiceEntryCategory;
    calibrationCertificateFileId?: string;
    attachmentFileIds?: string[];
    surveyAccessId?: string | null;
    surveyTemplateId?: string | null;
    surveyTemplateVersion?: number | null;
  }): void {
    if (details.companyName !== undefined) {
      this.props.companyName = details.companyName;
    }

    if (details.contactName !== undefined) {
      this.props.contactName = details.contactName;
    }

    if (details.contactEmail !== undefined) {
      this.props.contactEmail = details.contactEmail;
    }

    if (details.serviceOrderIdentifier !== undefined) {
      this.props.serviceOrderIdentifier = details.serviceOrderIdentifier;
    }

    if (details.category !== undefined) {
      this.props.category = details.category;
    }

    if (details.calibrationCertificateFileId !== undefined) {
      this.props.calibrationCertificateFileId =
        details.calibrationCertificateFileId;
    }

    if (details.attachmentFileIds !== undefined) {
      this.props.attachmentFileIds = details.attachmentFileIds;
    }

    if (details.surveyAccessId !== undefined) {
      this.props.surveyAccessId = details.surveyAccessId ?? null;
    }

    if (details.surveyTemplateId !== undefined) {
      this.props.surveyTemplateId = details.surveyTemplateId ?? null;
    }

    if (details.surveyTemplateVersion !== undefined) {
      this.props.surveyTemplateVersion = details.surveyTemplateVersion ?? null;
    }

    this.touch();
  }

  markAsDeleted(): void {
    this.props.status = ServiceEntryStatus.DELETED;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}

export enum ServiceEntryStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}
