import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {
  ITenantReadRepository,
  ITenantReadRepositoryToken,
  ITenantUserReadRepository,
  ITenantUserReadRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import { AuthenticationException } from '@domain/exceptions';
import {
  TenantUser,
  TenantUserStatus,
  User,
  UserRole,
  UserStatus,
} from '@domain/entities';
import {
  AuthenticateUserDto,
  AuthenticateUserResultDto,
  AuthenticatedTenantAccessDto,
} from '@application/dto';
import {
  AuthenticateUserResultMapper,
  AuthTokenMapper,
} from '@application/mappers';

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepo: IUserReadRepository,
    @Inject(ITenantUserReadRepositoryToken)
    private readonly tenantUserReadRepo: ITenantUserReadRepository,
    @Inject(ITenantReadRepositoryToken)
    private readonly tenantReadRepo: ITenantReadRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    input: AuthenticateUserDto,
  ): Promise<AuthenticateUserResultDto> {
    const user = await this.fetchUser(input.email);

    await this.ensurePasswordMatches(input.password, user);
    this.ensureUserActive(user);

    const masterAccessToken = await this.buildMasterAccessToken(user);
    const tenantAccesses = await this.buildTenantAccesses(user);

    return AuthenticateUserResultMapper.toResult(
      user,
      masterAccessToken,
      tenantAccesses,
    );
  }

  private async fetchUser(email: string): Promise<User> {
    const { data } = await this.userReadRepo.findByEmail(email);
    if (!data || !data.id) {
      throw AuthenticationException.invalidCredentials();
    }
    return data;
  }

  private async ensurePasswordMatches(
    rawPassword: string,
    user: User,
  ): Promise<void> {
    const passwordMatches = await bcrypt.compare(rawPassword, user.password);

    if (!passwordMatches) {
      throw AuthenticationException.invalidCredentials();
    }
  }

  private ensureUserActive(user: User): void {
    if (user.status !== UserStatus.ACTIVE) {
      throw AuthenticationException.userInactive(user.status);
    }
  }

  private isMasterUser(user: User): boolean {
    return (
      user.role === UserRole.MASTER_ADMIN || user.role === UserRole.MASTER_STAFF
    );
  }

  private async buildMasterAccessToken(
    user: User,
  ): Promise<string | undefined> {
    if (!this.isMasterUser(user)) return undefined;

    const payload = AuthTokenMapper.toMasterPayload(user);

    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }

  private async buildTenantAccesses(
    user: User,
  ): Promise<AuthenticatedTenantAccessDto[]> {
    const { data } = await this.tenantUserReadRepo.findManyByUserId(user.id!);

    if (!data.length) return [];

    const activeTenantUsers = data.filter(
      (tenantUser) =>
        tenantUser.status === TenantUserStatus.ACTIVE && Boolean(tenantUser.id),
    );

    const tenantAccesses = await Promise.all(
      activeTenantUsers.map((tenantUser) =>
        this.mapTenantAccess(user, tenantUser),
      ),
    );

    return tenantAccesses.filter(
      (tenantAccess): tenantAccess is AuthenticatedTenantAccessDto =>
        tenantAccess !== null,
    );
  }

  private async mapTenantAccess(
    user: User,
    tenantUser: TenantUser,
  ): Promise<AuthenticatedTenantAccessDto | null> {
    const { data: tenant } = await this.tenantReadRepo.findById(
      tenantUser.tenantId,
    );

    const payload = AuthTokenMapper.toTenantPayload(user, tenantUser);

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return AuthenticateUserResultMapper.toTenantAccessDto({
      tenantUser,
      tenant: tenant ?? null,
      accessToken,
    });
  }
}
