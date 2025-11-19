import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export interface CustomerFiscalProfileContactInfo {
  name: string;
  phone: string;
  email: string;
}

export interface CustomerFiscalProfileFormData {
  businessName: string;
  rfc: string;
  taxRegime: string;
  street: string;
  number: string;
  neighborhood: string;
  delegation: string;
  city: string;
  postalCode: string;
  cfdiUse: string;
  paymentMethod: string;
  paymentForm: string;
  billingContact: CustomerFiscalProfileContactInfo;
  accountsPayableContact: CustomerFiscalProfileContactInfo;
  requirementsNotes: string | null;
}

export interface CustomerFiscalProfileProps {
  id?: string;
  customerId: string;
  status?: CustomerFiscalProfileStatus;
  formData?: CustomerFiscalProfileFormData | null;
  submittedAt?: Date | null;
  taxCertificateFileId?: string | null;
  invoiceRequirementsFileId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CustomerFiscalProfileStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export class CustomerFiscalProfile extends Entity<CustomerFiscalProfileProps> {
  constructor(props: CustomerFiscalProfileProps) {
    if (!props.id) {
      props.id = genId();
    }

    props.status = props.status ?? CustomerFiscalProfileStatus.PENDING;
    props.formData = props.formData ?? null;
    props.submittedAt = props.submittedAt ?? null;
    props.taxCertificateFileId = props.taxCertificateFileId ?? null;
    props.invoiceRequirementsFileId = props.invoiceRequirementsFileId ?? null;

    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get status(): CustomerFiscalProfileStatus {
    return this.props.status ?? CustomerFiscalProfileStatus.PENDING;
  }

  get formData(): CustomerFiscalProfileFormData | null {
    return this.props.formData ?? null;
  }

  get submittedAt(): Date | null {
    return this.props.submittedAt ?? null;
  }

  get taxCertificateFileId(): string | null {
    return this.props.taxCertificateFileId ?? null;
  }

  get invoiceRequirementsFileId(): string | null {
    return this.props.invoiceRequirementsFileId ?? null;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  markFormSubmitted(params: {
    formData: CustomerFiscalProfileFormData;
    taxCertificateFileId: string;
    invoiceRequirementsFileId?: string | null;
    submittedAt?: Date;
  }): void {
    this.props.formData = params.formData;
    this.props.taxCertificateFileId = params.taxCertificateFileId;
    this.props.invoiceRequirementsFileId =
      params.invoiceRequirementsFileId ?? null;
    this.props.status = CustomerFiscalProfileStatus.COMPLETED;
    this.props.submittedAt = params.submittedAt ?? new Date();
    this.touch();
  }

  resetSubmission(): void {
    this.props.formData = null;
    this.props.taxCertificateFileId = null;
    this.props.invoiceRequirementsFileId = null;
    this.props.status = CustomerFiscalProfileStatus.PENDING;
    this.props.submittedAt = null;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
