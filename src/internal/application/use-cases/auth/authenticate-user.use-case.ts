import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import { AuthenticationException } from '@domain/exceptions';
import { User, UserStatus } from '@domain/entities';
import {
  AuthenticateUserDto,
  AuthenticateUserResultDto,
} from '@application/dto';
import { AuthenticateUserResultMapper } from '@application/mappers';
import {
  MasterAccessTokenService,
  TenantAccessService,
} from '@application/services';

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepo: IUserReadRepository,
    private readonly masterAccessTokenService: MasterAccessTokenService,
    private readonly tenantAccessService: TenantAccessService,
  ) {}

  async execute(
    input: AuthenticateUserDto,
  ): Promise<AuthenticateUserResultDto> {
    const user = await this.fetchUser(input.email);

    await this.ensurePasswordMatches(input.password, user);
    this.ensureUserActive(user);

    const masterAccessToken =
      await this.masterAccessTokenService.generate(user);
    const tenantAccesses = await this.tenantAccessService.generateFor(user);

    return AuthenticateUserResultMapper.toResult(
      user,
      masterAccessToken,
      tenantAccesses,
    );
  }

  private async fetchUser(email: string): Promise<User> {
    const { data } = await this.userReadRepo.findByEmail(email);
    if (!data || !data.id) throw AuthenticationException.invalidCredentials();
    return data;
  }

  private async ensurePasswordMatches(
    rawPassword: string,
    user: User,
  ): Promise<void> {
    const passwordMatches = await bcrypt.compare(rawPassword, user?.password);

    if (!passwordMatches) {
      throw AuthenticationException.invalidCredentials();
    }
  }

  private ensureUserActive(user: User): void {
    if (user.status !== UserStatus.ACTIVE) {
      throw AuthenticationException.userInactive(user.status);
    }
  }
}
