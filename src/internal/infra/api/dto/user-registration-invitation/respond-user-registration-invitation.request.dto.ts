import { IsIn, IsNotEmpty, IsString } from 'class-validator';

import {
  RespondUserRegistrationInvitationDecision,
  RespondUserRegistrationInvitationDto,
} from '@application/dto';

const DECISIONS: RespondUserRegistrationInvitationDecision[] = [
  'ACCEPT',
  'DECLINE',
];

export class RespondUserRegistrationInvitationRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(DECISIONS)
  decision!: RespondUserRegistrationInvitationDecision;

  toDomain(token: string): RespondUserRegistrationInvitationDto {
    return {
      token,
      decision: this.decision,
    };
  }
}
