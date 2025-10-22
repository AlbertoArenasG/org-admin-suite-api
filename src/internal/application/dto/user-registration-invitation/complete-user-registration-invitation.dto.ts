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
      scope: UserRegistrationInvitationScope.TENANT;
      user: CreateUserResultDto;
    };

export type RespondUserRegistrationInvitationDecision = 'ACCEPT' | 'DECLINE';

export interface RespondUserRegistrationInvitationDto {
  token: string;
  decision: RespondUserRegistrationInvitationDecision;
}

export type RespondUserRegistrationInvitationResultDto =
  | {
      status: 'ACCEPTED';
      user: CreateUserResultDto;
    }
  | {
      status: 'DECLINED';
    };
