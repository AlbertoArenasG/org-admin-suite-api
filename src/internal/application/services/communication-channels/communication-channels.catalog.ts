export const COMMUNICATION_CHANNELS = {
  EMAIL: {
    code: 'EMAIL',
    nameKey: 'COMMUNICATION.CHANNEL.EMAIL',
  },
} as const;

export type CommunicationChannelCode = keyof typeof COMMUNICATION_CHANNELS;
