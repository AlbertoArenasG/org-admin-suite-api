import { Injectable } from '@nestjs/common';

import {
  ExpirationStatusPolicyCatalogDto,
  ExpirationStatusPolicyListItemDto,
  ExpirationStatusPolicyOptionDto,
  ExpirationStatusPolicyViewDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class ExpirationStatusPolicyPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toCreateResponse(result: ExpirationStatusPolicyViewDto) {
    return this.toViewResponse(result);
  }

  toUpdateResponse(result: ExpirationStatusPolicyViewDto) {
    return this.toViewResponse(result);
  }

  toViewResponse(result: ExpirationStatusPolicyViewDto) {
    return {
      expiration_status_policy_id: result.id,
      name: result.name,
      code: result.code,
      description: result.description,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `EXPIRATION_STATUS_POLICY.STATUS.${result.status}`,
      ),
      rules: result.rules.map((rule) => ({
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
      created_by: result.createdBy
        ? {
            user_id: result.createdBy.userId,
            name: result.createdBy.name,
            email: result.createdBy.email,
          }
        : null,
      updated_by: result.updatedBy
        ? {
            user_id: result.updatedBy.userId,
            name: result.updatedBy.name,
            email: result.updatedBy.email,
          }
        : null,
      created_at: result.createdAt,
      updated_at: result.updatedAt ?? null,
    };
  }

  toCollection(results: ExpirationStatusPolicyListItemDto[]) {
    return results.map((result) => ({
      expiration_status_policy_id: result.id,
      name: result.name,
      code: result.code,
      description: result.description,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `EXPIRATION_STATUS_POLICY.STATUS.${result.status}`,
      ),
      rules_count: result.rulesCount,
      created_at: result.createdAt,
      updated_at: result.updatedAt ?? null,
    }));
  }

  toOptionsResponse(results: ExpirationStatusPolicyOptionDto[]) {
    return results.map((result) => ({
      expiration_status_policy_id: result.id,
      name: result.name,
      code: result.code,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `EXPIRATION_STATUS_POLICY.STATUS.${result.status}`,
      ),
    }));
  }

  toCatalogResponse(result: ExpirationStatusPolicyCatalogDto) {
    return {
      statuses: result.statuses.map((item) => ({
        code: item.code,
        name: this.enumNameService.getEnumName(item.nameKey),
        name_key: item.nameKey,
      })),
    };
  }
}
