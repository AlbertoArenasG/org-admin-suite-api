import { Injectable } from '@nestjs/common';

import { CommunicationChannelViewDto } from '@application/dto';
import { getCommunicationChannels } from '@application/services/communication-channels';

@Injectable()
export class GetCommunicationChannelsUseCase {
  execute(): CommunicationChannelViewDto[] {
    return getCommunicationChannels().map((channel) => ({
      code: channel.code,
      nameKey: channel.nameKey,
    }));
  }
}
