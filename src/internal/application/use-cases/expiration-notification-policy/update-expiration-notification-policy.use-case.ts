import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateExpirationNotificationPolicyDto,
  UpdateExpirationNotificationPolicyResultDto,
} from '@application/dto';
import { ExpirationNotificationPolicyMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  ExpirationNotificationPolicyOffsetProps,
  ExpirationNotificationPolicyRepeatUntil,
  ExpirationNotificationPolicyTriggerMode,
  RecipientGroupStatus,
} from '@domain/entities';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IExpirationNotificationPolicyReadRepository,
  IExpirationNotificationPolicyReadRepositoryToken,
  IExpirationNotificationPolicyWriteRepository,
  IExpirationNotificationPolicyWriteRepositoryToken,
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class UpdateExpirationNotificationPolicyUseCase {
  constructor(
    @Inject(IExpirationNotificationPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationNotificationPolicyReadRepository,
    @Inject(IExpirationNotificationPolicyWriteRepositoryToken)
    private readonly writeRepository: IExpirationNotificationPolicyWriteRepository,
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(
    input: UpdateExpirationNotificationPolicyDto,
  ): Promise<UpdateExpirationNotificationPolicyResultDto> {
    const { data: policy } = await this.readRepository.findById(
      input.expirationNotificationPolicyId,
    );

    if (!policy) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.EXPIRATION_NOTIFICATION_POLICY,
        {
          expirationNotificationPolicyId: input.expirationNotificationPolicyId,
        },
      );
    }

    const code = this.generateCode(input.name);
    const rules = this.normalizeRules(input.rules);
    const recipientGroupsById = await this.resolveActiveRecipientGroups(rules);

    await this.ensureNameUnique(
      input.expirationNotificationPolicyId,
      input.name,
    );
    await this.ensureCodeUnique(input.expirationNotificationPolicyId, code);

    policy.updateDetails(
      {
        name: input.name,
        code,
        description: input.description,
        status: input.status,
        rules,
      },
      input.actorUserId,
    );

    const { data: updated } = await this.writeRepository.update(policy);
    const { createdByUser, updatedByUser } =
      await this.auditUserFetcher.fetchAuditUsers({
        createdBy: updated!.createdBy,
        updatedBy: updated!.updatedBy,
      });

    return ExpirationNotificationPolicyMapper.toViewDto(
      updated!,
      recipientGroupsById,
      createdByUser,
      updatedByUser,
    );
  }

  private async ensureNameUnique(
    expirationNotificationPolicyId: string,
    name: string,
  ): Promise<void> {
    const { data } = await this.readRepository.findByName(name);

    if (data && data.id !== expirationNotificationPolicyId) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.EXPIRATION_NOTIFICATION_POLICY_NAME,
        { name },
      );
    }
  }

  private async ensureCodeUnique(
    expirationNotificationPolicyId: string,
    code: string,
  ): Promise<void> {
    const { data } = await this.readRepository.findByCode(code);

    if (data && data.id !== expirationNotificationPolicyId) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.EXPIRATION_NOTIFICATION_POLICY_CODE,
        { code },
      );
    }
  }

  private normalizeRules(
    input: UpdateExpirationNotificationPolicyDto['rules'],
  ) {
    if (input.length === 0) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'rules',
      });
    }

    return input.map((rule, index) => {
      const startOffset = this.normalizeOffset(
        rule.startOffset,
        `rules.${index}.start_offset`,
        false,
      );
      const recipientGroupIds = this.normalizeRecipientGroupIds(
        rule.recipientGroupIds,
        `rules.${index}.recipient_group_ids`,
      );

      if (
        rule.triggerMode === ExpirationNotificationPolicyTriggerMode.ONE_TIME
      ) {
        if (rule.repeatEvery || rule.repeatUntil || rule.repeatFor) {
          throw InvalidValueException.create(
            InvalidValueExceptionCode.DEFAULT,
            {
              field: `rules.${index}`,
              reason: 'ONE_TIME_WITH_RECURRENCE_FIELDS',
            },
          );
        }
      }

      let repeatEvery: ExpirationNotificationPolicyOffsetProps | null = null;
      let repeatUntil: ExpirationNotificationPolicyRepeatUntil | null = null;
      let repeatFor: ExpirationNotificationPolicyOffsetProps | null = null;

      if (
        rule.triggerMode === ExpirationNotificationPolicyTriggerMode.RECURRING
      ) {
        if (!rule.repeatEvery) {
          throw InvalidValueException.create(
            InvalidValueExceptionCode.DEFAULT,
            {
              field: `rules.${index}.repeat_every`,
            },
          );
        }

        repeatEvery = this.normalizeOffset(
          rule.repeatEvery,
          `rules.${index}.repeat_every`,
          true,
        );
        repeatUntil = rule.repeatUntil ?? null;

        if (!repeatUntil) {
          throw InvalidValueException.create(
            InvalidValueExceptionCode.DEFAULT,
            {
              field: `rules.${index}.repeat_until`,
            },
          );
        }

        if (
          repeatUntil === ExpirationNotificationPolicyRepeatUntil.FIXED_DURATION
        ) {
          if (!rule.repeatFor) {
            throw InvalidValueException.create(
              InvalidValueExceptionCode.DEFAULT,
              {
                field: `rules.${index}.repeat_for`,
              },
            );
          }

          repeatFor = this.normalizeOffset(
            rule.repeatFor,
            `rules.${index}.repeat_for`,
            true,
          );
        } else if (rule.repeatFor) {
          throw InvalidValueException.create(
            InvalidValueExceptionCode.DEFAULT,
            {
              field: `rules.${index}.repeat_for`,
              reason: 'REPEAT_FOR_NOT_ALLOWED',
            },
          );
        }
      }

      return {
        ruleId: rule.ruleId,
        anchor: rule.anchor,
        startOffset,
        triggerMode: rule.triggerMode,
        recipientGroupIds,
        repeatEvery,
        repeatUntil,
        repeatFor,
      };
    });
  }

  private normalizeRecipientGroupIds(
    values: string[],
    field: string,
  ): string[] {
    const normalized = values.map((value) => value.trim()).filter(Boolean);

    if (new Set(normalized).size !== normalized.length) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field,
        reason: 'DUPLICATED_RECIPIENT_GROUP_IDS',
      });
    }

    return normalized;
  }

  private normalizeOffset(
    offset: ExpirationNotificationPolicyOffsetProps,
    field: string,
    requireNonZero: boolean,
  ): ExpirationNotificationPolicyOffsetProps {
    const normalized = {
      years: Math.max(0, Math.trunc(offset.years ?? 0)),
      months: Math.max(0, Math.trunc(offset.months ?? 0)),
      weeks: Math.max(0, Math.trunc(offset.weeks ?? 0)),
      days: Math.max(0, Math.trunc(offset.days ?? 0)),
    };

    const isZero =
      normalized.years === 0 &&
      normalized.months === 0 &&
      normalized.weeks === 0 &&
      normalized.days === 0;

    if (requireNonZero && isZero) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field,
        reason: 'OFFSET_EMPTY',
      });
    }

    return normalized;
  }

  private async resolveActiveRecipientGroups(
    rules: ReturnType<
      UpdateExpirationNotificationPolicyUseCase['normalizeRules']
    >,
  ) {
    const uniqueRecipientGroupIds = Array.from(
      new Set(rules.flatMap((rule) => rule.recipientGroupIds)),
    );

    if (uniqueRecipientGroupIds.length === 0) {
      return new Map();
    }

    const { data } = await this.recipientGroupReadRepository.findByIds(
      uniqueRecipientGroupIds,
    );
    const byId = new Map(
      data.map((recipientGroup) => [recipientGroup.id, recipientGroup]),
    );

    for (const recipientGroupId of uniqueRecipientGroupIds) {
      const recipientGroup = byId.get(recipientGroupId);

      if (
        !recipientGroup ||
        recipientGroup.status !== RecipientGroupStatus.ACTIVE
      ) {
        throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
          field: 'recipient_group_ids',
          value: recipientGroupId,
          reason: 'RECIPIENT_GROUP_NOT_ACTIVE',
        });
      }
    }

    return byId;
  }

  private generateCode(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_')
      .toUpperCase();
  }
}
