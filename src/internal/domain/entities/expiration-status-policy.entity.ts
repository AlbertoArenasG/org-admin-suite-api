import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export interface ExpirationStatusPolicyOffsetProps {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export interface ExpirationStatusPolicyRuleProps {
  ruleId?: string;
  startOffset: ExpirationStatusPolicyOffsetProps;
  label: string;
  colorHex: string;
}

export interface ExpirationStatusPolicyProps {
  id?: string;
  name: string;
  code: string;
  description: string | null;
  status?: ExpirationStatusPolicyStatus;
  rules: ExpirationStatusPolicyRuleProps[];
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ExpirationStatusPolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class ExpirationStatusPolicy extends Entity<ExpirationStatusPolicyProps> {
  constructor(props: ExpirationStatusPolicyProps) {
    props.id = props.id ?? genId();
    props.description = props.description ?? null;
    props.status = props.status ?? ExpirationStatusPolicyStatus.ACTIVE;
    props.rules = ExpirationStatusPolicy.normalizeRules(props.rules ?? []);
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

  get status(): ExpirationStatusPolicyStatus {
    return this.props.status ?? ExpirationStatusPolicyStatus.ACTIVE;
  }

  get rules(): ExpirationStatusPolicyRuleProps[] {
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

  get currentState(): ExpirationStatusPolicyProps {
    return this.props;
  }

  updateDetails(
    details: {
      name?: string;
      code?: string;
      description?: string | null;
      status?: ExpirationStatusPolicyStatus;
      rules?: ExpirationStatusPolicyRuleProps[];
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
      this.props.rules = ExpirationStatusPolicy.normalizeRules(details.rules);
    }

    this.touch(updatedBy);
  }

  markAsDeleted(updatedBy?: string | null): void {
    this.props.status = ExpirationStatusPolicyStatus.DELETED;
    this.touch(updatedBy);
  }

  private touch(updatedBy?: string | null): void {
    if (updatedBy !== undefined) {
      this.props.updatedBy = updatedBy;
    }

    this.props.updatedAt = new Date();
  }

  private static normalizeRules(
    rules: ExpirationStatusPolicyRuleProps[],
  ): ExpirationStatusPolicyRuleProps[] {
    return [...rules]
      .map((rule) => ({
        ruleId: rule.ruleId ?? genId(),
        startOffset: ExpirationStatusPolicy.normalizeOffset(rule.startOffset),
        label: rule.label.trim(),
        colorHex: rule.colorHex.trim().toUpperCase(),
      }))
      .sort(
        (a, b) =>
          ExpirationStatusPolicy.toComparableOffset(a.startOffset) -
          ExpirationStatusPolicy.toComparableOffset(b.startOffset),
      );
  }

  private static normalizeOffset(
    offset: ExpirationStatusPolicyOffsetProps,
  ): ExpirationStatusPolicyOffsetProps {
    return {
      years: Math.max(0, Math.trunc(offset.years ?? 0)),
      months: Math.max(0, Math.trunc(offset.months ?? 0)),
      weeks: Math.max(0, Math.trunc(offset.weeks ?? 0)),
      days: Math.max(0, Math.trunc(offset.days ?? 0)),
    };
  }

  private static toComparableOffset(
    offset: ExpirationStatusPolicyOffsetProps,
  ): number {
    return (
      offset.years * 365 + offset.months * 30 + offset.weeks * 7 + offset.days
    );
  }
}
