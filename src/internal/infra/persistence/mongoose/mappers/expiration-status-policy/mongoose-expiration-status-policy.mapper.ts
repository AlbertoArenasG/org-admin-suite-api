import { ExpirationStatusPolicy } from '@domain/entities';
import { ExpirationStatusPolicyDocument } from '@infra/persistence/mongoose/schemas/expiration-status-policy';

export class MongooseExpirationStatusPolicyMapper {
  static toDomain(
    document: ExpirationStatusPolicyDocument | null,
  ): ExpirationStatusPolicy | null {
    if (!document) {
      return null;
    }

    return new ExpirationStatusPolicy({
      id: document.expiration_status_policy_id,
      name: document.name,
      code: document.code,
      description: document.description ?? null,
      status: document.status,
      rules: (document.rules ?? []).map((rule) => ({
        ruleId: rule.rule_id,
        startOffset: {
          years: rule.start_offset?.years ?? 0,
          months: rule.start_offset?.months ?? 0,
          weeks: rule.start_offset?.weeks ?? 0,
          days: rule.start_offset?.days ?? 0,
        },
        label: rule.label,
        colorHex: rule.color_hex,
      })),
      createdBy: document.created_by ?? null,
      updatedBy: document.updated_by ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  static toMongoose(policy: ExpirationStatusPolicy) {
    return {
      name: policy.name,
      code: policy.code,
      description: policy.description,
      status: policy.status,
      rules: policy.rules.map((rule) => ({
        rule_id: rule.ruleId,
        start_offset: {
          years: rule.startOffset.years,
          months: rule.startOffset.months,
          weeks: rule.startOffset.weeks,
          days: rule.startOffset.days,
        },
        label: rule.label,
        color_hex: rule.colorHex,
      })),
      created_by: policy.createdBy,
      updated_by: policy.updatedBy,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
    };
  }
}
