import { ServiceEntryAccess } from '@domain/entities';
import { ServiceEntryAccessDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseServiceEntryAccessMapper {
  static toDomain(
    document: ServiceEntryAccessDocument,
  ): ServiceEntryAccess | null {
    if (!document) {
      return null;
    }

    return new ServiceEntryAccess({
      id: document.service_entry_access_id,
      serviceEntryId: document.service_entry_id,
      tokenHash: document.token_hash,
      lastViewedAt: document.last_viewed_at ?? null,
      downloadedAt: document.downloaded_at ?? null,
      downloadCount: document.download_count ?? 0,
      createdAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    });
  }

  static toMongoose(access: ServiceEntryAccess) {
    return {
      service_entry_access_id: access.id,
      service_entry_id: access.serviceEntryId,
      token_hash: access.tokenHash,
      last_viewed_at: access.lastViewedAt,
      downloaded_at: access.downloadedAt,
      download_count: access.downloadCount,
    };
  }
}
