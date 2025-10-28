import { Inject, Injectable } from '@nestjs/common';

import { IEmailService, IEmailServiceToken } from '@domain/ports/services';
import { UserPasswordResetEmailDto } from '@application/dto';

@Injectable()
export class UserPasswordResetNotifierService {
  constructor(
    @Inject(IEmailServiceToken)
    private readonly emailService: IEmailService,
  ) {}

  async sendPasswordResetEmail(
    payload: UserPasswordResetEmailDto,
  ): Promise<void> {
    await this.emailService.sendUserPasswordReset(payload);
  }
}
