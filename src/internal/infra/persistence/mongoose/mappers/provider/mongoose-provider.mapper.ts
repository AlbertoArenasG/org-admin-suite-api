import { Provider } from '@domain/entities';
import { ProviderDocument } from '@infra/persistence/mongoose/schemas/provider/provider.schema';

export class MongooseProviderMapper {
  static toDomain(document: ProviderDocument): Provider | null {
    if (!document) return null;

    return new Provider({
      id: document.provider_id,
      companyName: document.company_name,
      providerCode: document.provider_code,
      accessToken: document.access_token,
      contact: {
        name: document.contact.name,
        phone: document.contact.phone,
        email: document.contact.email,
      },
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  static toMongoose(provider: Provider) {
    return {
      company_name: provider.companyName,
      provider_code: provider.providerCode,
      access_token: provider.accessToken,
      contact: {
        name: provider.contact.name,
        phone: provider.contact.phone,
        email: provider.contact.email,
      },
      status: provider.status,
    };
  }
}
