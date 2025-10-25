import { Injectable } from '@nestjs/common';

import { MultiChannelNotificationService } from '@application/services/notification';
import { ServiceEntryCreatedNotificationDto } from '@application/dto';

@Injectable()
export class ServiceEntryNotifierService {
  constructor(
    private readonly notificationService: MultiChannelNotificationService,
  ) {}

  async notifyServiceEntryCreated(payload: ServiceEntryCreatedNotificationDto) {
    await this.notificationService.sendServiceEntryCreated(payload);
  }
}
