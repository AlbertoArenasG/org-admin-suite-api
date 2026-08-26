import { Model } from 'mongoose';

import { ContactStatus, UserStatus } from '@domain/entities';
import {
  ContactDocument,
  ContactSchema,
  UserDocument,
  UserSchema,
} from '@infra/persistence/mongoose/schemas';
import {
  MongooseSeedContext,
  MongooseSeedDefinition,
  SeedReportItem,
} from '../shared/mongoose-seed.types';

const INTERNAL_COMPANY_NAME = 'ICSACV';

function getUserModel(
  connection: MongooseSeedContext['connection'],
): Model<UserDocument> {
  return (
    connection.models[UserDocument.name] ??
    connection.model(UserDocument.name, UserSchema)
  );
}

function getContactModel(
  connection: MongooseSeedContext['connection'],
): Model<ContactDocument> {
  return (
    connection.models[ContactDocument.name] ??
    connection.model(ContactDocument.name, ContactSchema)
  );
}

function mapUserStatusToContactStatus(status: UserStatus): ContactStatus {
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

function buildCellPhoneValue(user: UserDocument): string | null {
  const countryCode = user.cell_phone?.country_code ?? '';
  const number = user.cell_phone?.number ?? '';
  const value = `${countryCode}${number}`.trim();

  return value.length > 0 ? value : null;
}

function buildFullName(name: string, lastname: string): string {
  return `${name} ${lastname}`.trim();
}

export const contactsFromUsersSeed: MongooseSeedDefinition = {
  name: 'contacts-from-users',
  async run(context: MongooseSeedContext): Promise<SeedReportItem> {
    const userModel = getUserModel(context.connection);
    const contactModel = getContactModel(context.connection);

    const report: SeedReportItem = {
      name: 'contacts-from-users',
      created: 0,
      updated: 0,
      unchanged: 0,
    };

    const users = await userModel.find({}).sort({ createdAt: 1 }).exec();

    context.logger.info(
      `contacts-from-users: processing ${users.length} existing users.`,
    );

    for (const user of users) {
      const contactStatus = mapUserStatusToContactStatus(user.status);
      const primaryEmail = user.email.trim();
      const primaryCellPhone = buildCellPhoneValue(user);
      const fullName = buildFullName(user.name, user.lastname);

      const existing = await contactModel.findOne({
        user_id: user.user_id,
      });

      if (!existing) {
        await contactModel.create({
          user_id: user.user_id,
          name: user.name,
          lastname: user.lastname,
          full_name: fullName,
          company_names: [INTERNAL_COMPANY_NAME],
          emails: primaryEmail ? [{ value: primaryEmail }] : [],
          phones: [],
          cell_phones: primaryCellPhone ? [{ value: primaryCellPhone }] : [],
          status: contactStatus,
          created_by: user.user_id,
          updated_by: user.user_id,
          createdAt: user.createdAt ?? context.now,
          updatedAt: user.updatedAt ?? context.now,
        });

        report.created += 1;
        continue;
      }

      let shouldUpdate = false;

      if (existing.name !== user.name) {
        existing.name = user.name;
        shouldUpdate = true;
      }

      if (existing.lastname !== user.lastname) {
        existing.lastname = user.lastname;
        shouldUpdate = true;
      }

      if (existing.full_name !== fullName) {
        existing.full_name = fullName;
        shouldUpdate = true;
      }

      const existingPrimaryEmail = existing.emails?.[0]?.value ?? null;
      if (existingPrimaryEmail !== primaryEmail) {
        existing.emails = primaryEmail
          ? [{ value: primaryEmail }, ...(existing.emails ?? []).slice(1)]
          : [];
        shouldUpdate = true;
      }

      const existingPrimaryCellPhone = existing.cell_phones?.[0]?.value ?? null;
      if (existingPrimaryCellPhone !== primaryCellPhone) {
        existing.cell_phones = primaryCellPhone
          ? [
              { value: primaryCellPhone },
              ...(existing.cell_phones ?? []).slice(1),
            ]
          : [];
        shouldUpdate = true;
      }

      if (!existing.company_names || existing.company_names.length === 0) {
        existing.company_names = [INTERNAL_COMPANY_NAME];
        shouldUpdate = true;
      }

      if (existing.status !== contactStatus) {
        existing.status = contactStatus;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        existing.updated_by = user.user_id;
        await existing.save();
        report.updated += 1;
        continue;
      }

      report.unchanged += 1;
    }

    context.logger.info(
      `contacts-from-users: processed=${users.length} created=${report.created} updated=${report.updated} unchanged=${report.unchanged}`,
    );

    return report;
  },
};
