import { User } from '@domain/entities';
import { UserDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseUserMapper {
  static toDomain(userDocument: UserDocument): User | null {
    if (!userDocument) return null;
    return new User({
      id: userDocument.user_id,
      name: userDocument.name,
      lastname: userDocument.lastname,
      email: userDocument.email,
      password: userDocument.password,
      role: userDocument.role,
      status: userDocument.status,
      createdAt: userDocument.createdAt,
      updatedAt: userDocument.updatedAt,
    });
  }

  static toMongoose(user: User) {
    return {
      name: user.name,
      lastname: user.lastname,
      full_name: `${user.name} ${user.lastname}`,
      email: user.email,
      password: user.password,
      role: user.role,
      status: user.status,
    };
  }
}
