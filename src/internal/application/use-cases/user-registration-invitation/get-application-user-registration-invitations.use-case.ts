import { Inject, Injectable } from '@nestjs/common';

import {
  IUserRegistrationInvitationReadRepository,
  IUserRegistrationInvitationReadRepositoryToken,
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
  ) {}

  async execute(
    input: GetApplicationUserRegistrationInvitationsDto,
  ): Promise<GetApplicationUserRegistrationInvitationsResultDto> {
    const { data, total } =
      await this.invitationReadRepository.findAllApplicationInvitations(input);

    return {
      data: data
        .map((record) =>
          UserRegistrationInvitationMapper.toApplicationDto(record),
        )
        .filter(
          (record): record is NonNullable<typeof record> => record !== null,
        ),
      total,
    };
  }
}
