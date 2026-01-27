import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';
import { ContactInfo } from '@domain/value-objects';

export interface ProviderFiscalProfileContactInfo {
  name: string;
  phone: string;
  email: string;
}

export interface ProviderFiscalProfileAddressInfo {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface ProviderFiscalProfileFormData {
  businessName: string;
  rfc: string;
  address: ProviderFiscalProfileAddressInfo;
  billingContact: ProviderFiscalProfileContactInfo;
  notes: string | null;
}

export interface ProviderFiscalProfileProps {
  id?: string;
  providerId: string;
  status?: ProviderFiscalProfileStatus;
  formData?: ProviderFiscalProfileFormData | null;
  submittedAt?: Date | null;
  taxStatusCertificateFileId?: string | null;
  taxComplianceOpinionFileId?: string | null;
  addressProofFileId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ProviderFiscalProfileStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export class ProviderFiscalProfile extends Entity<ProviderFiscalProfileProps> {
  constructor(props: ProviderFiscalProfileProps) {
    if (!props.id) {
      props.id = genId();
    }

    props.status = props.status ?? ProviderFiscalProfileStatus.PENDING;
    props.formData = props.formData ?? null;
    props.submittedAt = props.submittedAt ?? null;
    props.taxStatusCertificateFileId = props.taxStatusCertificateFileId ?? null;
    props.taxComplianceOpinionFileId = props.taxComplianceOpinionFileId ?? null;
    props.addressProofFileId = props.addressProofFileId ?? null;

    super(props);
  }

  get id(): string {
    return this.props.id;
  }

  get providerId(): string {
    return this.props.providerId;
  }

  get status(): ProviderFiscalProfileStatus {
    return this.props.status ?? ProviderFiscalProfileStatus.PENDING;
  }

  get formData(): ProviderFiscalProfileFormData | null {
    return this.props.formData ?? null;
  }

  get submittedAt(): Date | null {
    return this.props.submittedAt ?? null;
  }

  get taxStatusCertificateFileId(): string | null {
    return this.props.taxStatusCertificateFileId ?? null;
  }

  get taxComplianceOpinionFileId(): string | null {
    return this.props.taxComplianceOpinionFileId ?? null;
  }

  get addressProofFileId(): string | null {
    return this.props.addressProofFileId ?? null;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  markFormSubmitted(params: {
    formData: ProviderFiscalProfileFormData;
    taxStatusCertificateFileId: string;
    taxComplianceOpinionFileId: string;
    addressProofFileId: string;
    submittedAt?: Date;
  }): void {
    // Validate billingContact
    if (params.formData.billingContact) {
      new ContactInfo(params.formData.billingContact);
    }

    this.props.formData = params.formData;
    this.props.taxStatusCertificateFileId = params.taxStatusCertificateFileId;
    this.props.taxComplianceOpinionFileId = params.taxComplianceOpinionFileId;
    this.props.addressProofFileId = params.addressProofFileId;
    this.props.status = ProviderFiscalProfileStatus.COMPLETED;
    this.props.submittedAt = params.submittedAt ?? new Date();
    this.touch();
  }

  resetSubmission(): void {
    this.props.formData = null;
    this.props.taxStatusCertificateFileId = null;
    this.props.taxComplianceOpinionFileId = null;
    this.props.addressProofFileId = null;
    this.props.status = ProviderFiscalProfileStatus.PENDING;
    this.props.submittedAt = null;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
