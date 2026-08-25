import { Inject, Injectable } from '@nestjs/common';

import {
  IUserRegistrationInvitationReadRepository,
  IUserRegistrationInvitationReadRepositoryToken,
  IRoleReadRepository,
  IRoleReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  GetApplicationUserRegistrationInvitationsDto,
  GetApplicationUserRegistrationInvitationsResultDto,
} from '@application/dto';
import { UserRegistrationInvitationMapper } from '@application/mappers';

@Injectable()
export class GetApplicationUserRegistrationInvitationsUseCase {
  constructor(
    @Inject(IUserRegistrationInvitationReadRepositoryToken)
    private readonly invitationReadRepository: IUserRegistrationInvitationReadRepository,
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
  ) {}

  async execute(
    input: GetApplicationUserRegistrationInvitationsDto,
  ): Promise<GetApplicationUserRegistrationInvitationsResultDto> {
    const { data, total } =
      await this.invitationReadRepository.findAllApplicationInvitations(input);
    const roleNamesByRoleId = await this.resolveRoleNamesByRoleId(data);

    return {
      data: data
        .map((record) =>
          UserRegistrationInvitationMapper.toApplicationDto(
            record,
            record.roleId
              ? (roleNamesByRoleId.get(record.roleId) ?? null)
              : null,
          ),
        )
        .filter(
          (record): record is NonNullable<typeof record> => record !== null,
        ),
      total,
    };
  }

  private async resolveRoleNamesByRoleId(
    invitations: { roleId: string | null }[],
  ) {
    const roleIds = Array.from(
      new Set(
        invitations
          .map((invitation) => invitation.roleId)
          .filter((roleId): roleId is string => Boolean(roleId)),
      ),
    );
    const resolvedRoles = await Promise.all(
      roleIds.map(async (roleId) => {
        const { data } = await this.roleReadRepository.findById(roleId);
        return [roleId, data?.name ?? null] as const;
      }),
    );

    return new Map(
      resolvedRoles.filter(
        (entry): entry is readonly [string, string] => entry[1] !== null,
      ),
    );
  }
}
