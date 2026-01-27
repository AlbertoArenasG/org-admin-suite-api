import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';
import { ContactInfo, ContactInfoProps } from '@domain/value-objects';

export interface ProviderContactInfo {
  name: string | null;
  phone: string | null;
  email: string | null;
}

export interface ProviderProps {
  id?: string;
  companyName: string;
  providerCode: string;
  accessToken: string;
  contact: ProviderContactInfo;
  status?: ProviderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ProviderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class Provider extends Entity<ProviderProps> {
  constructor(props: ProviderProps) {
    if (!props.id) {
      props.id = genId();
    }

    if (props.contact?.name && props.contact?.phone && props.contact?.email) {
      const contact = new ContactInfo(props.contact as ContactInfoProps);
      props.contact = {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
      };
    }

    props.status = props.status ?? ProviderStatus.ACTIVE;
    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get companyName(): string {
    return this.props.companyName;
  }

  get providerCode(): string {
    return this.props.providerCode;
  }

  get accessToken(): string {
    return this.props.accessToken;
  }

  get contact(): ContactInfo {
    return {
      name: this.props.contact?.name,
      phone: this.props.contact?.phone,
      email: this.props.contact?.email,
    } as ContactInfo;
  }

  get status(): ProviderStatus {
    return this.props.status ?? ProviderStatus.ACTIVE;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  activate(): void {
    this.props.status = ProviderStatus.ACTIVE;
    this.touch();
  }

  deactivate(): void {
    this.props.status = ProviderStatus.INACTIVE;
    this.touch();
  }

  markAsDeleted(): void {
    this.props.status = ProviderStatus.DELETED;
    this.touch();
  }

  updateAccessToken(token: string): void {
    this.props.accessToken = token;
    this.touch();
  }

  updateDetails(details: {
    companyName?: string;
    providerCode?: string;
    contact?: ProviderContactInfo;
  }): void {
    if (details.companyName !== undefined) {
      this.props.companyName = details.companyName;
    }

    if (details.providerCode !== undefined) {
      this.props.providerCode = details.providerCode;
    }

    if (details.contact !== undefined) {
      const contact = new ContactInfo(details.contact);
      this.props.contact = contact;
    }

    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
