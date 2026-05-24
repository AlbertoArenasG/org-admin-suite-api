import { Inject, Injectable } from '@nestjs/common';
import {
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import { AuditUserDto } from '@application/dto';

@Injectable()
export class AuditUserFetcherService {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
  ) {}

  async fetchAuditUser(userId: string | null): Promise<AuditUserDto | null> {
    if (!userId) {
      return null;
    }

    const { data: user } = await this.userReadRepository.findById(userId);

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      name: user.fullName,
      email: user.email,
    };
  }

  async fetchAuditUsers(params: {
    createdBy?: string | null;
    updatedBy?: string | null;
  }): Promise<{
    createdByUser: AuditUserDto | null;
    updatedByUser: AuditUserDto | null;
  }> {
    const [createdByUser, updatedByUser] = await Promise.all([
      this.fetchAuditUser(params.createdBy ?? null),
      this.fetchAuditUser(params.updatedBy ?? null),
    ]);

    return { createdByUser, updatedByUser };
  }
}
