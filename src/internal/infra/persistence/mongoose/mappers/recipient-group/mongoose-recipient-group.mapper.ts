import { RecipientGroup } from '@domain/entities';
import { RecipientGroupDocument } from '@infra/persistence/mongoose/schemas/recipient-group';

export class MongooseRecipientGroupMapper {
  static toDomain(
    document: RecipientGroupDocument | null,
  ): RecipientGroup | null {
    if (!document) {
      return null;
    }

    return new RecipientGroup({
      id: document.recipient_group_id,
      name: document.name,
      code: document.code,
      description: document.description ?? null,
      enabledChannels: document.enabled_channels ?? [],
      contactIds: document.contact_ids ?? [],
      status: document.status,
      createdBy: document.created_by ?? null,
      updatedBy: document.updated_by ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  static toMongoose(recipientGroup: RecipientGroup) {
    return {
      name: recipientGroup.name,
      code: recipientGroup.code,
      description: recipientGroup.description,
      enabled_channels: recipientGroup.enabledChannels,
      contact_ids: recipientGroup.contactIds,
      status: recipientGroup.status,
      created_by: recipientGroup.createdBy,
      updated_by: recipientGroup.updatedBy,
    };
  }
}
