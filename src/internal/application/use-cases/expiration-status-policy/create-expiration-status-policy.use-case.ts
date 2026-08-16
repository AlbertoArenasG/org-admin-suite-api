import { Inject, Injectable } from '@nestjs/common';

import {
  CreateExpirationStatusPolicyDto,
  CreateExpirationStatusPolicyResultDto,
} from '@application/dto';
import { ExpirationStatusPolicyMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  ExpirationStatusPolicy,
  ExpirationStatusPolicyOffsetProps,
} from '@domain/entities';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IExpirationStatusPolicyReadRepository,
  IExpirationStatusPolicyReadRepositoryToken,
  IExpirationStatusPolicyWriteRepository,
  IExpirationStatusPolicyWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class CreateExpirationStatusPolicyUseCase {
  constructor(
    @Inject(IExpirationStatusPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationStatusPolicyReadRepository,
    @Inject(IExpirationStatusPolicyWriteRepositoryToken)
    private readonly writeRepository: IExpirationStatusPolicyWriteRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(
    input: CreateExpirationStatusPolicyDto,
  ): Promise<CreateExpirationStatusPolicyResultDto> {
    const code = this.generateCode(input.name);
    const rules = this.normalizeRules(input.rules);

    await this.ensureNameUnique(input.name);
    await this.ensureCodeUnique(code);

    const policy = new ExpirationStatusPolicy({
      name: input.name,
      code,
      description: input.description,
      status: input.status,
      rules,
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { data } = await this.writeRepository.create(policy);
    const createdByUser = await this.auditUserFetcher.fetchAuditUser(
      input.actorUserId,
    );

    return ExpirationStatusPolicyMapper.toViewDto(
      data!,
      createdByUser,
      createdByUser,
    );
  }

  private async ensureNameUnique(name: string): Promise<void> {
    const { data } = await this.readRepository.findByName(name);

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.EXPIRATION_STATUS_POLICY_NAME,
        { name },
      );
    }
  }

  private async ensureCodeUnique(code: string): Promise<void> {
    const { data } = await this.readRepository.findByCode(code);

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.EXPIRATION_STATUS_POLICY_CODE,
        { code },
      );
    }
  }

  private normalizeRules(input: CreateExpirationStatusPolicyDto['rules']) {
    if (input.length === 0) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'rules',
      });
    }

    return input.map((rule, index) => ({
      ruleId: rule.ruleId,
      startOffset: this.normalizeOffset(rule.startOffset, `rules.${index}`),
      label: this.normalizeLabel(rule.label, `rules.${index}.label`),
      colorHex: this.normalizeColorHex(
        rule.colorHex,
        `rules.${index}.color_hex`,
      ),
    }));
  }

  private normalizeOffset(
    offset: ExpirationStatusPolicyOffsetProps,
    field: string,
  ): ExpirationStatusPolicyOffsetProps {
    const normalized = {
      years: Math.max(0, Math.trunc(offset.years ?? 0)),
      months: Math.max(0, Math.trunc(offset.months ?? 0)),
      weeks: Math.max(0, Math.trunc(offset.weeks ?? 0)),
      days: Math.max(0, Math.trunc(offset.days ?? 0)),
    };

    if (
      normalized.years === 0 &&
      normalized.months === 0 &&
      normalized.weeks === 0 &&
      normalized.days === 0
    ) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field,
        reason: 'OFFSET_EMPTY',
      });
    }

    return normalized;
  }

  private normalizeLabel(label: string, field: string): string {
    const normalized = label.trim();

    if (!normalized) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field,
      });
    }

    return normalized;
  }

  private normalizeColorHex(colorHex: string, field: string): string {
    const normalized = colorHex.trim().toUpperCase();

    if (!/^#[0-9A-F]{6}$/.test(normalized)) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field,
        value: colorHex,
        reason: 'INVALID_COLOR_HEX',
      });
    }

    return normalized;
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
