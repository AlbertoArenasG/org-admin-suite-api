import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '@domain/entities';
import { AuthTokenMapper } from '@application/mappers';

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generate(user: User): Promise<string> {
    const payload = AuthTokenMapper.toPayload(user);

    return this.jwtService.signAsync(payload);
  }
}
