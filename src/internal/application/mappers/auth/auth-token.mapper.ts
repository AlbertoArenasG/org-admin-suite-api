import { User } from '@domain/entities';
import { AuthTokenPayloadDto } from '@application/dto';

export class AuthTokenMapper {
  static toPayload(user: User): AuthTokenPayloadDto {
    return {
      sub: user.id!,
      systemRole: user.systemRole,
      roleId: user.roleId,
    };
  }
}
