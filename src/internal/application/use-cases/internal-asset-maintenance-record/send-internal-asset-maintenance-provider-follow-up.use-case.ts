import { Inject, Injectable } from '@nestjs/common';

import {
  GetInternalAssetMaintenanceRecordByIdResultDto,
  SendInternalAssetMaintenanceProviderFollowUpDto,
} from '@application/dto';
import { InternalAssetMaintenanceRecordMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  collectPolicyIds,
  collectProviderFollowUpRecipientGroupIds,
} from './internal-asset-maintenance-record.shared';
import {
  Contact,
  ContactStatus,
  InternalAssetMaintenanceRecord,
  NotificationChannel,
  RecipientGroup,
  RecipientGroupStatus,
} from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IContactReadRepository,
  IContactReadRepositoryToken,
  IInternalAssetMaintenanceRecordReadRepository,
  IInternalAssetMaintenanceRecordReadRepositoryToken,
  IInternalAssetMaintenanceRecordWriteRepository,
  IInternalAssetMaintenanceRecordWriteRepositoryToken,
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
} from '@domain/ports/repositories';
import { IEmailService, IEmailServiceToken } from '@domain/ports/services';

@Injectable()
export class SendInternalAssetMaintenanceProviderFollowUpUseCase {
  constructor(
    @Inject(IInternalAssetMaintenanceRecordReadRepositoryToken)
    private readonly readRepository: IInternalAssetMaintenanceRecordReadRepository,
    @Inject(IInternalAssetMaintenanceRecordWriteRepositoryToken)
    private readonly writeRepository: IInternalAssetMaintenanceRecordWriteRepository,
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
    @Inject(IContactReadRepositoryToken)
    private readonly contactReadRepository: IContactReadRepository,
    @Inject(IEmailServiceToken)
    private readonly emailService: IEmailService,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(
    input: SendInternalAssetMaintenanceProviderFollowUpDto,
  ): Promise<GetInternalAssetMaintenanceRecordByIdResultDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);

    if (!record) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
        entity: 'internal_asset_maintenance_record',
        recordId: input.recordId,
      });
    }

    if (!record.provider?.sentToProvider) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'provider.sent_to_provider',
        reason: 'PROVIDER_NOT_SENT',
      });
    }

    if (!record.providerFollowUp?.enabled) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'provider_follow_up.enabled',
        reason: 'PROVIDER_FOLLOW_UP_DISABLED',
      });
    }

    if (record.providerFollowUp.rules.length === 0) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'provider_follow_up.rules',
        reason: 'PROVIDER_FOLLOW_UP_RULES_REQUIRED',
      });
    }

    const recipientGroupIds = collectProviderFollowUpRecipientGroupIds([
      record,
    ]);
    const { data: recipientGroups } =
      await this.recipientGroupReadRepository.findByIds(recipientGroupIds);
    const recipientGroupsById = new Map(
      recipientGroups.map((recipientGroup) => [
        recipientGroup.id,
        recipientGroup,
      ]),
    );

    const emailEnabledGroups = recipientGroups.filter(
      (recipientGroup) =>
        recipientGroup.status === RecipientGroupStatus.ACTIVE &&
        recipientGroup.enabledChannels.includes(NotificationChannel.EMAIL),
    );
    const contactIds = Array.from(
      new Set(
        emailEnabledGroups.flatMap(
          (recipientGroup) => recipientGroup.contactIds,
        ),
      ),
    );
    const { data: contacts } =
      await this.contactReadRepository.findByIds(contactIds);
    const contactsById = new Map(
      contacts.map((contact) => [contact.id, contact]),
    );

    const toEmails = new Set<string>();
    const ccEmails = new Set<string>();

    for (const rule of record.providerFollowUp.rules) {
      for (const recipientGroupId of rule.recipientGroupIds) {
        this.collectEmailsFromGroup(
          recipientGroupId,
          recipientGroupsById,
          contactsById,
          toEmails,
        );
      }

      for (const recipientGroupId of rule.ccRecipientGroupIds) {
        this.collectEmailsFromGroup(
          recipientGroupId,
          recipientGroupsById,
          contactsById,
          ccEmails,
        );
      }
    }

    for (const email of toEmails) {
      if (ccEmails.has(email)) {
        ccEmails.delete(email);
      }
    }

    if (toEmails.size === 0) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'provider_follow_up',
        reason: 'NO_PROVIDER_FOLLOW_UP_RECIPIENTS',
      });
    }

    await this.emailService.sendGenericEmail({
      to: Array.from(toEmails),
      cc: Array.from(ccEmails),
      subject: `Seguimiento de activo interno ${record.assetIdentifier}`,
      html: this.buildEmailHtmlFromRecord(record),
    });

    record.updateDetails(
      {
        providerFollowUp: {
          ...record.providerFollowUp,
          lastSentAt: new Date(),
        },
      },
      input.actorUserId,
    );
    const { data: updated } = await this.writeRepository.update(record);
    const policiesById = await this.readRepository.findPoliciesByIds(
      collectPolicyIds(updated ? [updated] : []),
    );
    const [createdBy, updatedBy] = await Promise.all([
      this.auditUserFetcher.fetchAuditUser(record.createdBy),
      this.auditUserFetcher.fetchAuditUser(input.actorUserId),
    ]);

    return InternalAssetMaintenanceRecordMapper.toViewDto(updated!, {
      ...policiesById,
      recipientGroupsById,
      createdBy,
      updatedBy,
    });
  }

  private collectEmailsFromGroup(
    recipientGroupId: string,
    recipientGroupsById: Map<string, RecipientGroup>,
    contactsById: Map<string, Contact>,
    target: Set<string>,
  ): void {
    const recipientGroup = recipientGroupsById.get(recipientGroupId);

    if (
      !recipientGroup ||
      recipientGroup.status !== RecipientGroupStatus.ACTIVE ||
      !recipientGroup.enabledChannels.includes(NotificationChannel.EMAIL)
    ) {
      return;
    }

    for (const contactId of recipientGroup.contactIds) {
      const contact = contactsById.get(contactId);
      const email = contact?.emails?.[0]?.value?.trim();

      if (
        contact &&
        contact.status === ContactStatus.ACTIVE &&
        email &&
        email.length > 0
      ) {
        target.add(email);
      }
    }
  }

  private buildEmailHtml(record: {
    assetName: string;
    assetIdentifier: string;
    assetMaintenanceType: string;
    provider: { providerName: string | null } | null;
    expirationDate: string;
  }): string {
    return `
      <p>Hola${record.provider?.providerName ? `, ${record.provider.providerName}` : ''}.</p>
      <p>Solicitamos seguimiento del activo interno <strong>${record.assetName}</strong> con identificador <strong>${record.assetIdentifier}</strong>.</p>
      <p>Tipo de mantenimiento: <strong>${record.assetMaintenanceType}</strong>.</p>
      <p>Fecha de vencimiento vigente: <strong>${record.expirationDate}</strong>.</p>
      <p>Favor de compartir el estatus actualizado cuando sea posible.</p>
    `;
  }

  private buildEmailHtmlFromRecord(record: InternalAssetMaintenanceRecord) {
    return this.buildEmailHtml({
      assetName: record.assetName,
      assetIdentifier: record.assetIdentifier,
      assetMaintenanceType: record.assetMaintenanceType,
      provider: record.provider,
      expirationDate: record.expirationDate,
    });
  }
}
