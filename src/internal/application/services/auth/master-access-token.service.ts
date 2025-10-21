import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User, UserRole } from '@domain/entities';
import { AuthTokenMapper } from '@application/mappers';

@Injectable()
export class MasterAccessTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generate(user: User): Promise<string | undefined> {
    if (!this.isMasterUser(user)) {
      return undefined;
    }

    const payload = AuthTokenMapper.toMasterPayload(user);
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }

  private isMasterUser(user: User): boolean {
    return (
      user.role === UserRole.MASTER_ADMIN || user.role === UserRole.MASTER_STAFF
    );
  }
}
