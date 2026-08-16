import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export interface ExpirationNotificationPolicyOffsetProps {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export enum ExpirationNotificationPolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export enum ExpirationNotificationPolicyAnchor {
  BEFORE_EXPIRATION = 'BEFORE_EXPIRATION',
  AFTER_EXPIRATION = 'AFTER_EXPIRATION',
}

export enum ExpirationNotificationPolicyTriggerMode {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING',
}

export enum ExpirationNotificationPolicyRepeatUntil {
  EXPIRATION_DATE = 'EXPIRATION_DATE',
  STATUS_CHANGES = 'STATUS_CHANGES',
  FIXED_DURATION = 'FIXED_DURATION',
}

export interface ExpirationNotificationPolicyRuleProps {
  ruleId?: string;
  anchor: ExpirationNotificationPolicyAnchor;
  startOffset: ExpirationNotificationPolicyOffsetProps;
  triggerMode: ExpirationNotificationPolicyTriggerMode;
  recipientGroupIds: string[];
  repeatEvery?: ExpirationNotificationPolicyOffsetProps | null;
  repeatUntil?: ExpirationNotificationPolicyRepeatUntil | null;
  repeatFor?: ExpirationNotificationPolicyOffsetProps | null;
}

export interface ExpirationNotificationPolicyProps {
  id?: string;
  name: string;
  code: string;
  description: string | null;
  status?: ExpirationNotificationPolicyStatus;
  rules: ExpirationNotificationPolicyRuleProps[];
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ExpirationNotificationPolicy extends Entity<ExpirationNotificationPolicyProps> {
  constructor(props: ExpirationNotificationPolicyProps) {
    props.id = props.id ?? genId();
    props.description = props.description ?? null;
    props.status = props.status ?? ExpirationNotificationPolicyStatus.ACTIVE;
    props.rules = ExpirationNotificationPolicy.normalizeRules(
      props.rules ?? [],
    );
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

  get status(): ExpirationNotificationPolicyStatus {
    return this.props.status ?? ExpirationNotificationPolicyStatus.ACTIVE;
  }

  get rules(): ExpirationNotificationPolicyRuleProps[] {
    return [...this.props.rules];
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

  get currentState(): ExpirationNotificationPolicyProps {
    return this.props;
  }

  updateDetails(
    details: {
      name?: string;
      code?: string;
      description?: string | null;
      status?: ExpirationNotificationPolicyStatus;
      rules?: ExpirationNotificationPolicyRuleProps[];
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

    if (details.status !== undefined) {
      this.props.status = details.status;
    }

    if (details.rules !== undefined) {
      this.props.rules = ExpirationNotificationPolicy.normalizeRules(
        details.rules,
      );
    }

    this.touch(updatedBy);
  }

  markAsDeleted(updatedBy?: string | null): void {
    this.props.status = ExpirationNotificationPolicyStatus.DELETED;
    this.touch(updatedBy);
  }

  private touch(updatedBy?: string | null): void {
    if (updatedBy !== undefined) {
      this.props.updatedBy = updatedBy;
    }

    this.props.updatedAt = new Date();
  }

  private static normalizeRules(
    rules: ExpirationNotificationPolicyRuleProps[],
  ): ExpirationNotificationPolicyRuleProps[] {
    return rules.map((rule) => ({
      ruleId: rule.ruleId ?? genId(),
      anchor: rule.anchor,
      startOffset: ExpirationNotificationPolicy.normalizeOffset(
        rule.startOffset,
      ),
      triggerMode: rule.triggerMode,
      recipientGroupIds: ExpirationNotificationPolicy.normalizeIds(
        rule.recipientGroupIds ?? [],
      ),
      repeatEvery: rule.repeatEvery
        ? ExpirationNotificationPolicy.normalizeOffset(rule.repeatEvery)
        : null,
      repeatUntil: rule.repeatUntil ?? null,
      repeatFor: rule.repeatFor
        ? ExpirationNotificationPolicy.normalizeOffset(rule.repeatFor)
        : null,
    }));
  }

  private static normalizeIds(values: string[]): string[] {
    return values.map((value) => value.trim()).filter(Boolean);
  }

  private static normalizeOffset(
    offset: ExpirationNotificationPolicyOffsetProps,
  ): ExpirationNotificationPolicyOffsetProps {
    return {
      years: Math.max(0, Math.trunc(offset.years ?? 0)),
      months: Math.max(0, Math.trunc(offset.months ?? 0)),
      weeks: Math.max(0, Math.trunc(offset.weeks ?? 0)),
      days: Math.max(0, Math.trunc(offset.days ?? 0)),
    };
  }
}
