import { Inject, Injectable } from '@nestjs/common';

import { Contact, ContactStatus, User, UserStatus } from '@domain/entities';
import {
  IContactReadRepository,
  IContactReadRepositoryToken,
  IContactWriteRepository,
  IContactWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class SyncUserContactService {
  private static readonly INTERNAL_COMPANY_NAME = 'ICSACV';

  constructor(
    @Inject(IContactReadRepositoryToken)
    private readonly contactReadRepository: IContactReadRepository,
    @Inject(IContactWriteRepositoryToken)
    private readonly contactWriteRepository: IContactWriteRepository,
  ) {}

  async syncFromUser(user: User): Promise<Contact> {
    const { data: existingContact } =
      await this.contactReadRepository.findByUserId(user.id);

    if (!existingContact) {
      const contact = new Contact({
        userId: user.id,
        name: user.name,
        lastname: user.lastname,
        companyNames: [SyncUserContactService.INTERNAL_COMPANY_NAME],
        emails: [{ value: user.email }],
        phones: [],
        cellPhones: this.toCellPhoneValues(user),
        status: this.mapUserStatus(user.status),
        createdBy: user.id,
        updatedBy: user.id,
        createdAt: user.createdAt ?? new Date(),
        updatedAt: user.updatedAt ?? new Date(),
      });

      const { data } = await this.contactWriteRepository.create(contact);
      return data!;
    }

    existingContact.syncFromUser({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      cellPhone: this.toPrimaryCellPhone(user),
      companyNames: [SyncUserContactService.INTERNAL_COMPANY_NAME],
      status: this.mapUserStatus(user.status),
    });

    const { data } = await this.contactWriteRepository.update(existingContact);
    return data!;
  }

  async markDeletedFromUser(user: User): Promise<void> {
    const { data: existingContact } =
      await this.contactReadRepository.findByUserId(user.id);

    if (!existingContact) {
      return;
    }

    if (existingContact.status === ContactStatus.DELETED) {
      return;
    }

    existingContact.markAsDeleted(user.id);
    await this.contactWriteRepository.update(existingContact);
  }

  private mapUserStatus(status: UserStatus): ContactStatus {
    switch (status) {
      case UserStatus.ACTIVE:
        return ContactStatus.ACTIVE;
      case UserStatus.INACTIVE:
        return ContactStatus.INACTIVE;
      case UserStatus.DELETED:
        return ContactStatus.DELETED;
      default:
        return ContactStatus.ACTIVE;
    }
  }

  private toPrimaryCellPhone(user: User): string | null {
    if (!user.hasCellPhone) {
      return null;
    }

    const countryCode = user.cellPhone.countryCode ?? '';
    const number = user.cellPhone.number ?? '';
    const value = `${countryCode}${number}`.trim();

    return value.length > 0 ? value : null;
  }

  private toCellPhoneValues(user: User): Array<{ value: string }> {
    const primaryValue = this.toPrimaryCellPhone(user);

    return primaryValue ? [{ value: primaryValue }] : [];
  }
}
