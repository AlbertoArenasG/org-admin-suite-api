import {
  CreateMasterUserResultDto,
  CreateUserResultDto,
} from '@application/dto/user';
import {
  UserRegistrationInvitationScope,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';

export interface CompleteNewUserRegistrationInvitationDto {
  token: string;
  password: string;
  userData?: UserRegistrationInvitationUserData | null;
}

export type CompleteNewUserRegistrationInvitationResultDto =
  | {
      scope: UserRegistrationInvitationScope.MASTER;
      user: CreateMasterUserResultDto;
    }
  | {
      scope: UserRegistrationInvitationScope.APPLICATION;
      user: CreateUserResultDto;
    };
