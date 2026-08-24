import { UserRegistrationInvitationStatus } from '@domain/ports/repositories';
import { DomainException } from './domain.exception';

export enum UserRegistrationInvitationExceptionCode {
  NOT_PENDING = 'USER_REGISTRATION_INVITATION.NOT_PENDING',
  CONCURRENT_MODIFICATION = 'USER_REGISTRATION_INVITATION.CONCURRENT_MODIFICATION',
}

export class UserRegistrationInvitationException extends DomainException {
  private constructor(
    code: UserRegistrationInvitationExceptionCode,
    details: Record<string, unknown> = {},
  ) {
    super(code, details);
  }

  static notPending(
    status: UserRegistrationInvitationStatus,
  ): UserRegistrationInvitationException {
    return new UserRegistrationInvitationException(
      UserRegistrationInvitationExceptionCode.NOT_PENDING,
      { status },
    );
  }

  static concurrentModification(): UserRegistrationInvitationException {
    return new UserRegistrationInvitationException(
      UserRegistrationInvitationExceptionCode.CONCURRENT_MODIFICATION,
    );
  }
}
