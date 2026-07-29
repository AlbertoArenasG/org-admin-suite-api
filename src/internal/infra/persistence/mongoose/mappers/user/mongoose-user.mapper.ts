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
      systemRole: userDocument.system_role,
      roleId: userDocument.role_id ?? null,
      status: userDocument.status,
      cellPhone: {
        countryCode: userDocument.cell_phone?.country_code || null,
        number: userDocument.cell_phone?.number || null,
      },
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
      system_role: user.systemRole,
      role_id: user.roleId,
      status: user.status,
      cell_phone: {
        country_code: user.cellPhone?.countryCode,
        number: user.cellPhone?.number,
      },
    };
  }
}
