import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export interface ServiceEntryAccessProps {
  id?: string;
  serviceEntryId: string;
  tokenHash: string;
  lastViewedAt?: Date | null;
  downloadedAt?: Date | null;
  downloadCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ServiceEntryAccess extends Entity<ServiceEntryAccessProps> {
  constructor(props: ServiceEntryAccessProps) {
    if (!props.id) {
      props.id = genId();
    }

    props.lastViewedAt = props.lastViewedAt ?? null;
    props.downloadedAt = props.downloadedAt ?? null;
    props.downloadCount = props.downloadCount ?? 0;

    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get serviceEntryId(): string {
    return this.props.serviceEntryId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get lastViewedAt(): Date | null {
    return this.props.lastViewedAt ?? null;
  }

  get downloadedAt(): Date | null {
    return this.props.downloadedAt ?? null;
  }

  get downloadCount(): number {
    return this.props.downloadCount ?? 0;
  }

  markViewed(): void {
    this.props.lastViewedAt = new Date();
    this.touch();
  }

  markDownloaded(): void {
    this.props.downloadedAt = new Date();
    this.props.downloadCount = (this.props.downloadCount ?? 0) + 1;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
