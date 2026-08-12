import { Injectable } from '@nestjs/common';

import { CommunicationChannelViewDto } from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class CommunicationChannelPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toResponse(channels: CommunicationChannelViewDto[]) {
    return channels.map((channel) => ({
      code: channel.code,
      name: this.enumNameService.getEnumName(channel.nameKey),
      name_key: channel.nameKey,
    }));
  }
}
