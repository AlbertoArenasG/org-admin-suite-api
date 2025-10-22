import { User, UserRole } from '@domain/entities';
import { AuthTokenPayloadDto } from '@application/dto';

export class AuthTokenMapper {
  static toPayload(user: User): AuthTokenPayloadDto {
    return {
      sub: user.id!,
      role: user.role,
      isMaster: AuthTokenMapper.isMaster(user.role),
    };
  }

  private static isMaster(role: UserRole): boolean {
    return role === UserRole.MASTER_ADMIN || role === UserRole.MASTER_STAFF;
  }
}
