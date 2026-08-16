import { Inject, Injectable } from '@nestjs/common';

import { IEmailService, IEmailServiceToken } from '@domain/ports/services';
import { InternalAssetMaintenanceProviderFollowUpNotificationDto } from '@application/dto';

@Injectable()
export class InternalAssetMaintenanceProviderFollowUpNotifierService {
  constructor(
    @Inject(IEmailServiceToken)
    private readonly emailService: IEmailService,
  ) {}

  async send(
    payload: InternalAssetMaintenanceProviderFollowUpNotificationDto,
  ): Promise<void> {
    await this.emailService.sendInternalAssetMaintenanceProviderFollowUp(
      payload,
    );
  }
}
