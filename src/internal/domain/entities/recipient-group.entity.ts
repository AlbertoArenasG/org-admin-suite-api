import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export interface RecipientGroupProps {
  id?: string;
  name: string;
  code: string;
  description: string | null;
  enabledChannels: string[];
  contactIds: string[];
  status?: RecipientGroupStatus;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum RecipientGroupStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export class RecipientGroup extends Entity<RecipientGroupProps> {
  constructor(props: RecipientGroupProps) {
    props.id = props.id ?? genId();
    props.description = props.description ?? null;
    props.enabledChannels = RecipientGroup.normalizeCodes(
      props.enabledChannels ?? [],
    );
    props.contactIds = RecipientGroup.normalizeContactIds(
      props.contactIds ?? [],
    );
    props.status = props.status ?? RecipientGroupStatus.ACTIVE;
    props.createdBy = props.createdBy ?? null;
    props.updatedBy = props.updatedBy ?? null;

    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get name(): string {
    return this.props.name;
  }

  get code(): string {
    return this.props.code;
  }

  get description(): string | null {
    return this.props.description ?? null;
  }

  get enabledChannels(): string[] {
    return [...this.props.enabledChannels];
  }

  get contactIds(): string[] {
    return [...this.props.contactIds];
  }

  get status(): RecipientGroupStatus {
    return this.props.status ?? RecipientGroupStatus.ACTIVE;
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

  get currentState(): RecipientGroupProps {
    return this.props;
  }

  updateDetails(
    details: {
      name?: string;
      code?: string;
      description?: string | null;
      enabledChannels?: string[];
      contactIds?: string[];
    },
    updatedBy?: string | null,
  ): void {
    if (details.name !== undefined) {
      this.props.name = details.name;
    }

    if (details.code !== undefined) {
      this.props.code = details.code;
    }

    if (details.description !== undefined) {
      this.props.description = details.description;
    }

    if (details.enabledChannels !== undefined) {
      this.props.enabledChannels = RecipientGroup.normalizeCodes(
        details.enabledChannels,
      );
    }

    if (details.contactIds !== undefined) {
      this.props.contactIds = RecipientGroup.normalizeContactIds(
        details.contactIds,
      );
    }

    this.touch(updatedBy);
  }

  markAsDeleted(updatedBy?: string | null): void {
    this.props.status = RecipientGroupStatus.DELETED;
    this.touch(updatedBy);
  }

  private touch(updatedBy?: string | null): void {
    if (updatedBy !== undefined) {
      this.props.updatedBy = updatedBy;
    }

    this.props.updatedAt = new Date();
  }

  private static normalizeCodes(values: string[]): string[] {
    return values.map((value) => value.trim().toUpperCase()).filter(Boolean);
  }

  private static normalizeContactIds(values: string[]): string[] {
    return values.map((value) => value.trim()).filter(Boolean);
  }
}
