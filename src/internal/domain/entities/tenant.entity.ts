import { Entity } from '@src/internal/core/entities/entity';
import { EntityCreatedEvent } from '@domain/events';
import { TenantConfigs, TenantConfigsInit } from '@domain/value-objects';

export interface TenantProps {
  id?: string;
  name: string;
  slug: string;
  status: TenantStatus;
  configs: TenantConfigs;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TenantConstructorProps extends Omit<TenantProps, 'configs'> {
  configs?: TenantConfigs | TenantConfigsInit;
}

export class Tenant extends Entity<TenantProps> {
  constructor(props: TenantConstructorProps) {
    const configs =
      props.configs instanceof TenantConfigs
        ? props.configs
        : new TenantConfigs(props.configs);

    super({
      ...props,
      configs,
    });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get status(): TenantStatus {
    return this.props.status;
  }

  get configs(): TenantConfigs {
    return this.props.configs;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get currentState(): TenantProps {
    return this.props;
  }

  updateSettings(configs: TenantConfigs | TenantConfigsInit): void {
    this.props.configs =
      configs instanceof TenantConfigs ? configs : new TenantConfigs(configs);
  }

  updateStatus(status: TenantStatus): void {
    this.props.status = status;
  }

  markAsCreated(): void {
    this.apply(new EntityCreatedEvent(this));
  }
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}
