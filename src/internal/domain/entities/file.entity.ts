import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export interface FileProps {
  id?: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  bucket: string;
  url?: string | null;
  uploadedBy?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class File extends Entity<FileProps> {
  constructor(props: FileProps) {
    if (!props.id) {
      props.id = genId();
    }
    if (props.metadata === undefined) {
      props.metadata = {};
    }
    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get originalName(): string {
    return this.props.originalName;
  }

  get filename(): string {
    return this.props.filename;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get size(): number {
    return this.props.size;
  }

  get storageKey(): string {
    return this.props.storageKey;
  }

  get bucket(): string {
    return this.props.bucket;
  }

  get url(): string | null | undefined {
    return this.props.url;
  }

  get uploadedBy(): string | null | undefined {
    return this.props.uploadedBy;
  }

  get metadata(): Record<string, unknown> | null | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  updateUrl(url: string | null): void {
    this.props.url = url;
    this.touch();
  }

  touch(): void {
    this.props.updatedAt = new Date();
  }
}
