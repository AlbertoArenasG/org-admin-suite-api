import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export interface ContactValueProps {
  value: string;
}

export interface ContactProps {
  id?: string;
  userId: string | null;
  name: string;
  lastname: string;
  companyNames: string[];
  emails: ContactValueProps[];
  phones: ContactValueProps[];
  cellPhones: ContactValueProps[];
  status?: ContactStatus;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ContactStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class Contact extends Entity<ContactProps> {
  constructor(props: ContactProps) {
    props.id = props.id ?? genId();
    props.userId = props.userId ?? null;
    props.companyNames = Contact.normalizeCompanyNames(
      props.companyNames ?? [],
    );
    props.status = props.status ?? ContactStatus.ACTIVE;
    props.createdBy = props.createdBy ?? null;
    props.updatedBy = props.updatedBy ?? null;
    props.emails = Contact.normalizeValues(props.emails ?? []);
    props.phones = Contact.normalizeValues(props.phones ?? []);
    props.cellPhones = Contact.normalizeValues(props.cellPhones ?? []);

    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get userId(): string | null {
    return this.props.userId ?? null;
  }

  get name(): string {
    return this.props.name;
  }

  get lastname(): string {
    return this.props.lastname;
  }

  get fullName(): string {
    return `${this.name} ${this.lastname}`.trim();
  }

  get companyNames(): string[] {
    return [...this.props.companyNames];
  }

  get emails(): ContactValueProps[] {
    return [...this.props.emails];
  }

  get phones(): ContactValueProps[] {
    return [...this.props.phones];
  }

  get cellPhones(): ContactValueProps[] {
    return [...this.props.cellPhones];
  }

  get status(): ContactStatus {
    return this.props.status ?? ContactStatus.ACTIVE;
  }

  get createdBy(): string | null {
    return this.props.createdBy ?? null;
  }

  get updatedBy(): string | null {
    return this.props.updatedBy ?? null;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get currentState(): ContactProps {
    return this.props;
  }

  activate(updatedBy?: string | null): void {
    this.props.status = ContactStatus.ACTIVE;
    this.touch(updatedBy);
  }

  deactivate(updatedBy?: string | null): void {
    this.props.status = ContactStatus.INACTIVE;
    this.touch(updatedBy);
  }

  markAsDeleted(updatedBy?: string | null): void {
    this.props.status = ContactStatus.DELETED;
    this.touch(updatedBy);
  }

  updateDetails(
    details: {
      name?: string;
      lastname?: string;
      companyNames?: string[];
      emails?: ContactValueProps[];
      phones?: ContactValueProps[];
      cellPhones?: ContactValueProps[];
    },
    updatedBy?: string | null,
  ): void {
    if (details.name !== undefined) {
      this.props.name = details.name;
    }

    if (details.lastname !== undefined) {
      this.props.lastname = details.lastname;
    }

    if (details.companyNames !== undefined) {
      this.props.companyNames = Contact.normalizeCompanyNames(
        details.companyNames,
      );
    }

    if (details.emails !== undefined) {
      this.props.emails = Contact.normalizeValues(details.emails);
    }

    if (details.phones !== undefined) {
      this.props.phones = Contact.normalizeValues(details.phones);
    }

    if (details.cellPhones !== undefined) {
      this.props.cellPhones = Contact.normalizeValues(details.cellPhones);
    }

    this.touch(updatedBy);
  }

  syncFromUser(input: {
    name: string;
    lastname: string;
    email: string;
    cellPhone: string | null;
    companyNames?: string[];
    status?: ContactStatus;
  }): void {
    this.props.name = input.name;
    this.props.lastname = input.lastname;
    this.props.emails = Contact.replacePrimaryValue(
      this.props.emails,
      input.email,
    );
    this.props.cellPhones = input.cellPhone
      ? Contact.replacePrimaryValue(this.props.cellPhones, input.cellPhone)
      : [];

    if (input.companyNames !== undefined) {
      this.props.companyNames = Contact.normalizeCompanyNames(
        input.companyNames,
      );
    }

    if (input.status !== undefined) {
      this.props.status = input.status;
    }

    this.touch();
  }

  private touch(updatedBy?: string | null): void {
    if (updatedBy !== undefined) {
      this.props.updatedBy = updatedBy;
    }

    this.props.updatedAt = new Date();
  }

  private static normalizeValues(
    values: ContactValueProps[],
  ): ContactValueProps[] {
    return values
      .map((item) => ({ value: item.value.trim() }))
      .filter((item) => item.value.length > 0);
  }

  private static normalizeCompanyNames(values: string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  }

  private static replacePrimaryValue(
    current: ContactValueProps[],
    value: string,
  ): ContactValueProps[] {
    const normalized = value.trim();
    if (!normalized) {
      return [];
    }

    if (current.length === 0) {
      return [{ value: normalized }];
    }

    const [first, ...rest] = current;
    return [
      { value: normalized },
      ...rest.filter((item) => item.value !== first.value),
    ];
  }
}
