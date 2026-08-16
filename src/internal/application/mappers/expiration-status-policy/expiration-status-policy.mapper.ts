import {
  AuditUserDto,
  ExpirationStatusPolicyCatalogDto,
  ExpirationStatusPolicyListItemDto,
  ExpirationStatusPolicyOptionDto,
  ExpirationStatusPolicyViewDto,
} from '@application/dto';
import {
  ExpirationStatusPolicy,
  ExpirationStatusPolicyStatus,
} from '@domain/entities';

export class ExpirationStatusPolicyMapper {
  static toListItemDto(
    policy: ExpirationStatusPolicy,
  ): ExpirationStatusPolicyListItemDto {
    return {
      id: policy.id,
      name: policy.name,
      code: policy.code,
      description: policy.description,
      status: policy.status,
      rulesCount: policy.rules.length,
      createdAt: policy.createdAt ?? new Date(),
      updatedAt: policy.updatedAt,
    };
  }

  static toOptionDto(
    policy: ExpirationStatusPolicy,
  ): ExpirationStatusPolicyOptionDto {
    return {
      id: policy.id,
      name: policy.name,
      code: policy.code,
      status: policy.status,
    };
  }

  static toViewDto(
    policy: ExpirationStatusPolicy,
    createdBy?: AuditUserDto | null,
    updatedBy?: AuditUserDto | null,
  ): ExpirationStatusPolicyViewDto {
    return {
      id: policy.id,
      name: policy.name,
      code: policy.code,
      description: policy.description,
      status: policy.status,
      rules: policy.rules.map((rule) => ({
        ruleId: rule.ruleId!,
        startOffset: { ...rule.startOffset },
        label: rule.label,
        colorHex: rule.colorHex,
      })),
      createdBy: createdBy ?? null,
      updatedBy: updatedBy ?? null,
      createdAt: policy.createdAt ?? new Date(),
      updatedAt: policy.updatedAt,
    };
  }

  static toCatalogDto(): ExpirationStatusPolicyCatalogDto {
    return {
      statuses: Object.values(ExpirationStatusPolicyStatus).map((status) => ({
        code: status,
        name: status,
        nameKey: `EXPIRATION_STATUS_POLICY.STATUS.${status}`,
      })),
    };
  }
}
