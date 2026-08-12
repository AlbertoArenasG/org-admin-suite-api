import { Inject, Injectable } from '@nestjs/common';

import {
  CreateRecipientGroupDto,
  CreateRecipientGroupResultDto,
} from '@application/dto';
import { RecipientGroupMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  getCommunicationChannel,
  normalizeCommunicationChannelCode,
} from '@application/services/communication-channels';
import {
  ContactStatus,
  RecipientGroup,
  RecipientGroupStatus,
} from '@domain/entities';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IContactReadRepository,
  IContactReadRepositoryToken,
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
  IRecipientGroupWriteRepository,
  IRecipientGroupWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class CreateRecipientGroupUseCase {
  constructor(
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
    @Inject(IRecipientGroupWriteRepositoryToken)
    private readonly recipientGroupWriteRepository: IRecipientGroupWriteRepository,
    @Inject(IContactReadRepositoryToken)
    private readonly contactReadRepository: IContactReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(
    input: CreateRecipientGroupDto,
  ): Promise<CreateRecipientGroupResultDto> {
    const code = this.generateCode(input.name);
    const enabledChannels = this.normalizeChannels(input.enabledChannels);
    const contactIds = this.normalizeContactIds(input.contactIds);

    await this.ensureNameUnique(input.name);
    await this.ensureCodeUnique(code);
    const contacts = await this.resolveActiveContacts(contactIds);

    const recipientGroup = new RecipientGroup({
      name: input.name,
      code,
      description: input.description,
      enabledChannels,
      contactIds,
      status: RecipientGroupStatus.ACTIVE,
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { data } =
      await this.recipientGroupWriteRepository.create(recipientGroup);
    const createdByUser = await this.auditUserFetcher.fetchAuditUser(
      input.actorUserId,
    );

    return RecipientGroupMapper.toViewDto(
      data!,
      contacts,
      createdByUser,
      createdByUser,
    );
  }

  private async ensureNameUnique(name: string): Promise<void> {
    const { data } = await this.recipientGroupReadRepository.findByName(name);

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.RECIPIENT_GROUP_NAME,
        { name },
      );
    }
  }

  private async ensureCodeUnique(code: string): Promise<void> {
    const { data } = await this.recipientGroupReadRepository.findByCode(code);

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.RECIPIENT_GROUP_CODE,
        { code },
      );
    }
  }

  private normalizeChannels(enabledChannels: string[]): string[] {
    const normalized = enabledChannels
      .map((code) => normalizeCommunicationChannelCode(code))
      .filter(Boolean);

    if (normalized.length === 0) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'enabled_channels',
      });
    }

    const unique = Array.from(new Set(normalized));

    for (const code of unique) {
      if (!getCommunicationChannel(code)) {
        throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
          field: 'enabled_channels',
          value: code,
          reason: 'INVALID_COMMUNICATION_CHANNEL',
        });
      }
    }

    return unique;
  }

  private normalizeContactIds(contactIds: string[]): string[] {
    const normalized = contactIds
      .map((contactId) => contactId.trim())
      .filter(Boolean);

    if (normalized.length === 0) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'contact_ids',
      });
    }

    if (new Set(normalized).size !== normalized.length) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'contact_ids',
        reason: 'DUPLICATED_CONTACT_IDS',
      });
    }

    return normalized;
  }

  private async resolveActiveContacts(contactIds: string[]) {
    const { data } = await this.contactReadRepository.findByIds(contactIds);
    const contactsById = new Map(data.map((contact) => [contact.id, contact]));

    const contacts = contactIds.map((contactId) => {
      const contact = contactsById.get(contactId);

      if (!contact || contact.status !== ContactStatus.ACTIVE) {
        throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
          field: 'contact_ids',
          value: contactId,
          reason: 'CONTACT_NOT_ACTIVE',
        });
      }

      return contact;
    });

    return contacts;
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
