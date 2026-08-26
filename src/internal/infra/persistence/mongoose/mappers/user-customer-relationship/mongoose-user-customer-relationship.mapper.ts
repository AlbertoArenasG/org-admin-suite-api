import { UserCustomerRelationship } from '@domain/entities';
import { UserCustomerRelationshipDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseUserCustomerRelationshipMapper {
  static toDomain(
    document: UserCustomerRelationshipDocument,
  ): UserCustomerRelationship | null {
    if (!document) {
      return null;
    }

    return new UserCustomerRelationship({
      id: document.user_customer_relationship_id,
      userId: document.user_id,
      customerId: document.customer_id,
    });
  }

  static toMongoose(relationship: UserCustomerRelationship) {
    return {
      user_customer_relationship_id: relationship.id,
      user_id: relationship.userId,
      customer_id: relationship.customerId,
    };
  }
}
