import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import { AuthenticationException } from '@domain/exceptions';
import { User, UserRole, UserStatus } from '@domain/entities';
import {
  AuthenticateUserDto,
  AuthenticateUserResultDto,
} from '@application/dto';
import {
  AuthenticateUserResultMapper,
  TenantAccessAggregate,
} from '@application/mappers';
import { AuthTokenService, TenantAccessService } from '@application/services';

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepo: IUserReadRepository,
    private readonly authTokenService: AuthTokenService,
    private readonly tenantAccessService: TenantAccessService,
  ) {}

  async execute(
    input: AuthenticateUserDto,
  ): Promise<AuthenticateUserResultDto> {
    const user = await this.fetchUser(input.email);

    await this.ensurePasswordMatches(input.password, user);
    this.ensureUserActive(user);

    const tenantAccesses = await this.tenantAccessService.generateFor(user);
    const tenants = tenantAccesses.map(({ tenantAccess }) => tenantAccess);
    const defaultTenantId = this.resolveDefaultTenantId(
      tenantAccesses,
      user.role,
    );
    const accessToken = await this.authTokenService.generate(
      user,
      tenantAccesses,
      defaultTenantId,
    );

    return AuthenticateUserResultMapper.toResult(
      user,
      accessToken,
      tenants,
      defaultTenantId,
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

  private resolveDefaultTenantId(
    tenantAccesses: TenantAccessAggregate[],
    role: UserRole,
  ): string | null {
    if (!tenantAccesses.length) {
      return null;
    }

    if (this.isMasterRole(role)) {
      return null;
    }

    return tenantAccesses[0]?.tenantAccess.tenantId ?? null;
  }

  private isMasterRole(role: UserRole): boolean {
    return role === UserRole.MASTER_ADMIN || role === UserRole.MASTER_STAFF;
  }
}
