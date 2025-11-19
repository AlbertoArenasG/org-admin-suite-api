import { Customer, CustomerStatus } from '@domain/entities';
import { CustomerDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseCustomerMapper {
  static toDomain(document: CustomerDocument): Customer | null {
    if (!document) {
      return null;
    }

    return new Customer({
      id: document.customer_id,
      companyName: document.company_name,
      clientCode: document.client_code,
      accessToken: document.access_token,
      status: document.status ?? CustomerStatus.ACTIVE,
      createdAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    });
  }

  static toMongoose(customer: Customer) {
    return {
      customer_id: customer.id,
      company_name: customer.companyName,
      client_code: customer.clientCode,
      access_token: customer.accessToken ?? null,
      status: customer.status,
    };
  }
}
