import { User } from '@domain/entities';
import { AuthTokenPayloadDto } from '@application/dto';

export class AuthTokenMapper {
  static toPayload(user: User): AuthTokenPayloadDto {
    return {
      sub: user.id!,
      role: user.role,
      isMaster: user.isMaster,
    };
  }
}
