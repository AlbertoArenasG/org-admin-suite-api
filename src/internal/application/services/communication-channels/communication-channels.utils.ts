import {
  COMMUNICATION_CHANNELS,
  CommunicationChannelCode,
} from './communication-channels.catalog';

export interface CommunicationChannelCatalogItem {
  code: CommunicationChannelCode;
  nameKey: string;
}

export function getCommunicationChannel(
  code: string,
): CommunicationChannelCatalogItem | null {
  const normalizedCode = normalizeCommunicationChannelCode(
    code,
  ) as CommunicationChannelCode;
  const channel = COMMUNICATION_CHANNELS[normalizedCode];

  if (!channel) {
    return null;
  }

  return {
    code: channel.code,
    nameKey: channel.nameKey,
  };
}

export function getCommunicationChannels(): CommunicationChannelCatalogItem[] {
  return Object.values(COMMUNICATION_CHANNELS).map((channel) => ({
    code: channel.code,
    nameKey: channel.nameKey,
  }));
}

export function normalizeCommunicationChannelCode(code: string): string {
  return code.trim().replace(/\s+/g, '_').toUpperCase();
}

export function isValidCommunicationChannel(code: string): boolean {
  return getCommunicationChannel(code) !== null;
}
