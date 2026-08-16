import { Injectable } from '@nestjs/common';

import {
  ExpirationNotificationPolicyCatalogDto,
  ExpirationNotificationPolicyListItemDto,
  ExpirationNotificationPolicyOptionDto,
  ExpirationNotificationPolicyRecipientGroupSummaryDto,
  ExpirationNotificationPolicyViewDto,
  RecipientGroupChannelDto,
} from '@application/dto';
import { getCommunicationChannel } from '@application/services/communication-channels';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class ExpirationNotificationPolicyPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toCreateResponse(result: ExpirationNotificationPolicyViewDto) {
    return this.toViewResponse(result);
  }

  toUpdateResponse(result: ExpirationNotificationPolicyViewDto) {
    return this.toViewResponse(result);
  }

  toViewResponse(result: ExpirationNotificationPolicyViewDto) {
    return {
      expiration_notification_policy_id: result.id,
      name: result.name,
      code: result.code,
      description: result.description,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `EXPIRATION_NOTIFICATION_POLICY.STATUS.${result.status}`,
      ),
      rules: result.rules.map((rule) => ({
        rule_id: rule.ruleId,
        anchor: {
          code: rule.anchor,
          name: this.enumNameService.getEnumName(
            `EXPIRATION_NOTIFICATION_POLICY.ANCHOR.${rule.anchor}`,
          ),
          name_key: `EXPIRATION_NOTIFICATION_POLICY.ANCHOR.${rule.anchor}`,
        },
        start_offset: {
          years: rule.startOffset.years,
          months: rule.startOffset.months,
          weeks: rule.startOffset.weeks,
          days: rule.startOffset.days,
        },
        trigger_mode: {
          code: rule.triggerMode,
          name: this.enumNameService.getEnumName(
            `EXPIRATION_NOTIFICATION_POLICY.TRIGGER_MODE.${rule.triggerMode}`,
          ),
          name_key: `EXPIRATION_NOTIFICATION_POLICY.TRIGGER_MODE.${rule.triggerMode}`,
        },
        recipient_group_ids: rule.recipientGroupIds,
        repeat_every: rule.repeatEvery
          ? {
              years: rule.repeatEvery.years,
              months: rule.repeatEvery.months,
              weeks: rule.repeatEvery.weeks,
              days: rule.repeatEvery.days,
            }
          : null,
        repeat_until: rule.repeatUntil
          ? {
              code: rule.repeatUntil,
              name: this.enumNameService.getEnumName(
                `EXPIRATION_NOTIFICATION_POLICY.REPEAT_UNTIL.${rule.repeatUntil}`,
              ),
              name_key: `EXPIRATION_NOTIFICATION_POLICY.REPEAT_UNTIL.${rule.repeatUntil}`,
            }
          : null,
        repeat_for: rule.repeatFor
          ? {
              years: rule.repeatFor.years,
              months: rule.repeatFor.months,
              weeks: rule.repeatFor.weeks,
              days: rule.repeatFor.days,
            }
          : null,
        recipient_groups: rule.recipientGroups.map((recipientGroup) =>
          this.toRecipientGroupResponse(recipientGroup),
        ),
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

  toCollection(results: ExpirationNotificationPolicyListItemDto[]) {
    return results.map((result) => ({
      expiration_notification_policy_id: result.id,
      name: result.name,
      code: result.code,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `EXPIRATION_NOTIFICATION_POLICY.STATUS.${result.status}`,
      ),
      rules_count: result.rulesCount,
      created_at: result.createdAt,
      updated_at: result.updatedAt ?? null,
    }));
  }

  toOptionsResponse(results: ExpirationNotificationPolicyOptionDto[]) {
    return results.map((result) => ({
      expiration_notification_policy_id: result.id,
      name: result.name,
      code: result.code,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `EXPIRATION_NOTIFICATION_POLICY.STATUS.${result.status}`,
      ),
    }));
  }

  toCatalogResponse(result: ExpirationNotificationPolicyCatalogDto) {
    return {
      statuses: result.statuses.map((item) => this.toCatalogItem(item)),
      anchors: result.anchors.map((item) => this.toCatalogItem(item)),
      trigger_modes: result.triggerModes.map((item) =>
        this.toCatalogItem(item),
      ),
      repeat_until_values: result.repeatUntilValues.map((item) =>
        this.toCatalogItem(item),
      ),
    };
  }

  private toCatalogItem(item: { code: string; nameKey: string }) {
    return {
      code: item.code,
      name: this.enumNameService.getEnumName(item.nameKey),
      name_key: item.nameKey,
    };
  }

  private toRecipientGroupResponse(
    recipientGroup: ExpirationNotificationPolicyRecipientGroupSummaryDto,
  ) {
    return {
      recipient_group_id: recipientGroup.id,
      name: recipientGroup.name,
      code: recipientGroup.code,
      status_id: recipientGroup.status,
      status_name: this.enumNameService.getEnumName(
        `RECIPIENT_GROUP.STATUS.${recipientGroup.status}`,
      ),
      enabled_channels: recipientGroup.enabledChannels.map((channel) =>
        this.toChannelResponse(channel),
      ),
    };
  }

  private toChannelResponse(channel: RecipientGroupChannelDto) {
    const catalogItem = getCommunicationChannel(channel.code);

    return {
      code: channel.code,
      name: catalogItem
        ? this.enumNameService.getEnumName(catalogItem.nameKey)
        : channel.code,
      name_key: catalogItem?.nameKey ?? null,
    };
  }
}
