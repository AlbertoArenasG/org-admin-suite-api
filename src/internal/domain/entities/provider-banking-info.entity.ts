import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export interface ProviderBankingInfoFormData {
  beneficiary: string;
  bank: string;
  accountNumber: string;
  clabe: string;
  creditGranted: string | null;
  notes: string | null;
}

export interface ProviderBankingInfoProps {
  id?: string;
  providerId: string;
  status?: ProviderBankingInfoStatus;
  formData?: ProviderBankingInfoFormData | null;
  submittedAt?: Date | null;
  bankStatementFileId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ProviderBankingInfoStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export class ProviderBankingInfo extends Entity<ProviderBankingInfoProps> {
  constructor(props: ProviderBankingInfoProps) {
    if (!props.id) {
      props.id = genId();
    }

    props.status = props.status ?? ProviderBankingInfoStatus.PENDING;
    props.formData = props.formData ?? null;
    props.submittedAt = props.submittedAt ?? null;
    props.bankStatementFileId = props.bankStatementFileId ?? null;

    super(props);
  }

  get id(): string {
    return this.props.id;
  }

  get providerId(): string {
    return this.props.providerId;
  }

  get status(): ProviderBankingInfoStatus {
    return this.props.status ?? ProviderBankingInfoStatus.PENDING;
  }

  get formData(): ProviderBankingInfoFormData | null {
    return this.props.formData ?? null;
  }

  get submittedAt(): Date | null {
    return this.props.submittedAt ?? null;
  }

  get bankStatementFileId(): string | null {
    return this.props.bankStatementFileId ?? null;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  markFormSubmitted(params: {
    formData: ProviderBankingInfoFormData;
    bankStatementFileId: string;
    submittedAt?: Date;
  }): void {
    this.props.formData = params.formData;
    this.props.bankStatementFileId = params.bankStatementFileId;
    this.props.status = ProviderBankingInfoStatus.COMPLETED;
    this.props.submittedAt = params.submittedAt ?? new Date();
    this.touch();
  }

  resetSubmission(): void {
    this.props.formData = null;
    this.props.bankStatementFileId = null;
    this.props.status = ProviderBankingInfoStatus.PENDING;
    this.props.submittedAt = null;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
