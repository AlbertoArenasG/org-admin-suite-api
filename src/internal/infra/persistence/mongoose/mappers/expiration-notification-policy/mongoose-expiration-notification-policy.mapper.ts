import { ExpirationNotificationPolicy } from '@domain/entities';
import { ExpirationNotificationPolicyDocument } from '@infra/persistence/mongoose/schemas/expiration-notification-policy';

export class MongooseExpirationNotificationPolicyMapper {
  static toDomain(
    document: ExpirationNotificationPolicyDocument | null,
  ): ExpirationNotificationPolicy | null {
    if (!document) {
      return null;
    }

    return new ExpirationNotificationPolicy({
      id: document.expiration_notification_policy_id,
      name: document.name,
      code: document.code,
      description: document.description ?? null,
      status: document.status,
      rules: (document.rules ?? []).map((rule) => ({
        ruleId: rule.rule_id,
        anchor: rule.anchor,
        startOffset: {
          years: rule.start_offset?.years ?? 0,
          months: rule.start_offset?.months ?? 0,
          weeks: rule.start_offset?.weeks ?? 0,
          days: rule.start_offset?.days ?? 0,
        },
        triggerMode: rule.trigger_mode,
        recipientGroupIds: rule.recipient_group_ids ?? [],
        repeatEvery: rule.repeat_every
          ? {
              years: rule.repeat_every.years ?? 0,
              months: rule.repeat_every.months ?? 0,
              weeks: rule.repeat_every.weeks ?? 0,
              days: rule.repeat_every.days ?? 0,
            }
          : null,
        repeatUntil: rule.repeat_until ?? null,
        repeatFor: rule.repeat_for
          ? {
              years: rule.repeat_for.years ?? 0,
              months: rule.repeat_for.months ?? 0,
              weeks: rule.repeat_for.weeks ?? 0,
              days: rule.repeat_for.days ?? 0,
            }
          : null,
      })),
      createdBy: document.created_by ?? null,
      updatedBy: document.updated_by ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  static toMongoose(policy: ExpirationNotificationPolicy) {
    return {
      name: policy.name,
      code: policy.code,
      description: policy.description,
      status: policy.status,
      rules: policy.rules.map((rule) => ({
        rule_id: rule.ruleId,
        anchor: rule.anchor,
        start_offset: {
          years: rule.startOffset.years,
          months: rule.startOffset.months,
          weeks: rule.startOffset.weeks,
          days: rule.startOffset.days,
        },
        trigger_mode: rule.triggerMode,
        recipient_group_ids: rule.recipientGroupIds,
        repeat_every: rule.repeatEvery
          ? {
              years: rule.repeatEvery.years,
              months: rule.repeatEvery.months,
              weeks: rule.repeatEvery.weeks,
              days: rule.repeatEvery.days,
            }
          : null,
        repeat_until: rule.repeatUntil ?? null,
        repeat_for: rule.repeatFor
          ? {
              years: rule.repeatFor.years,
              months: rule.repeatFor.months,
              weeks: rule.repeatFor.weeks,
              days: rule.repeatFor.days,
            }
          : null,
      })),
      created_by: policy.createdBy,
      updated_by: policy.updatedBy,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
    };
  }
}
