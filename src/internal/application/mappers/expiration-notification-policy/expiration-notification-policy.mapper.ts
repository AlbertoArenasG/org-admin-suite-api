import {
  AuditUserDto,
  ExpirationNotificationPolicyCatalogDto,
  ExpirationNotificationPolicyListItemDto,
  ExpirationNotificationPolicyOptionDto,
  ExpirationNotificationPolicyRecipientGroupSummaryDto,
  ExpirationNotificationPolicyViewDto,
} from '@application/dto';
import { ExpirationNotificationPolicy, RecipientGroup } from '@domain/entities';

export class ExpirationNotificationPolicyMapper {
  static toListItemDto(
    policy: ExpirationNotificationPolicy,
  ): ExpirationNotificationPolicyListItemDto {
    return {
      id: policy.id,
      name: policy.name,
      code: policy.code,
      status: policy.status,
      rulesCount: policy.rules.length,
      createdAt: policy.createdAt ?? new Date(),
      updatedAt: policy.updatedAt,
    };
  }

  static toOptionDto(
    policy: ExpirationNotificationPolicy,
  ): ExpirationNotificationPolicyOptionDto {
    return {
      id: policy.id,
      name: policy.name,
      code: policy.code,
      status: policy.status,
    };
  }

  static toViewDto(
    policy: ExpirationNotificationPolicy,
    recipientGroupsById: Map<string, RecipientGroup>,
    createdBy?: AuditUserDto | null,
    updatedBy?: AuditUserDto | null,
  ): ExpirationNotificationPolicyViewDto {
    return {
      id: policy.id,
      name: policy.name,
      code: policy.code,
      description: policy.description,
      status: policy.status,
      rules: policy.rules.map((rule) => ({
        ruleId: rule.ruleId!,
        anchor: rule.anchor,
        startOffset: { ...rule.startOffset },
        triggerMode: rule.triggerMode,
        recipientGroupIds: [...rule.recipientGroupIds],
        repeatEvery: rule.repeatEvery ? { ...rule.repeatEvery } : null,
        repeatUntil: rule.repeatUntil ?? null,
        repeatFor: rule.repeatFor ? { ...rule.repeatFor } : null,
        recipientGroups: rule.recipientGroupIds
          .map(
            (recipientGroupId) =>
              recipientGroupsById.get(recipientGroupId) ?? null,
          )
          .filter(
            (recipientGroup): recipientGroup is RecipientGroup =>
              recipientGroup !== null,
          )
          .map((recipientGroup) =>
            this.toRecipientGroupSummary(recipientGroup),
          ),
      })),
      createdBy: createdBy ?? null,
      updatedBy: updatedBy ?? null,
      createdAt: policy.createdAt ?? new Date(),
      updatedAt: policy.updatedAt,
    };
  }

  static toCatalogDto(): ExpirationNotificationPolicyCatalogDto {
    return {
      statuses: [
        {
          code: 'ACTIVE',
          name: 'ACTIVE',
          nameKey: 'EXPIRATION_NOTIFICATION_POLICY.STATUS.ACTIVE',
        },
        {
          code: 'INACTIVE',
          name: 'INACTIVE',
          nameKey: 'EXPIRATION_NOTIFICATION_POLICY.STATUS.INACTIVE',
        },
        {
          code: 'DELETED',
          name: 'DELETED',
          nameKey: 'EXPIRATION_NOTIFICATION_POLICY.STATUS.DELETED',
        },
      ],
      anchors: [
        {
          code: 'BEFORE_EXPIRATION',
          name: 'BEFORE_EXPIRATION',
          nameKey: 'EXPIRATION_NOTIFICATION_POLICY.ANCHOR.BEFORE_EXPIRATION',
        },
        {
          code: 'AFTER_EXPIRATION',
          name: 'AFTER_EXPIRATION',
          nameKey: 'EXPIRATION_NOTIFICATION_POLICY.ANCHOR.AFTER_EXPIRATION',
        },
      ],
      triggerModes: [
        {
          code: 'ONE_TIME',
          name: 'ONE_TIME',
          nameKey: 'EXPIRATION_NOTIFICATION_POLICY.TRIGGER_MODE.ONE_TIME',
        },
        {
          code: 'RECURRING',
          name: 'RECURRING',
          nameKey: 'EXPIRATION_NOTIFICATION_POLICY.TRIGGER_MODE.RECURRING',
        },
      ],
      repeatUntilValues: [
        {
          code: 'EXPIRATION_DATE',
          name: 'EXPIRATION_DATE',
          nameKey:
            'EXPIRATION_NOTIFICATION_POLICY.REPEAT_UNTIL.EXPIRATION_DATE',
        },
        {
          code: 'STATUS_CHANGES',
          name: 'STATUS_CHANGES',
          nameKey: 'EXPIRATION_NOTIFICATION_POLICY.REPEAT_UNTIL.STATUS_CHANGES',
        },
        {
          code: 'FIXED_DURATION',
          name: 'FIXED_DURATION',
          nameKey: 'EXPIRATION_NOTIFICATION_POLICY.REPEAT_UNTIL.FIXED_DURATION',
        },
      ],
    };
  }

  private static toRecipientGroupSummary(
    recipientGroup: RecipientGroup,
  ): ExpirationNotificationPolicyRecipientGroupSummaryDto {
    return {
      id: recipientGroup.id,
      name: recipientGroup.name,
      code: recipientGroup.code,
      status: recipientGroup.status,
      enabledChannels: recipientGroup.enabledChannels.map((code) => ({ code })),
    };
  }
}
