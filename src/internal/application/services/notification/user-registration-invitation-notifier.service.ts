import { Inject, Injectable } from '@nestjs/common';

import { IEmailService, IEmailServiceToken } from '@domain/ports/services';
import { UserRegistrationInvitationEmailDto } from '@application/dto';

@Injectable()
export class UserRegistrationInvitationNotifierService {
  constructor(
    @Inject(IEmailServiceToken)
    private readonly emailService: IEmailService,
  ) {}

  async sendInvitation(
    payload: UserRegistrationInvitationEmailDto,
  ): Promise<void> {
    await this.emailService.sendUserRegistrationInvitation(payload);
  }
}
