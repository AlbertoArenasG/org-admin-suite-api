export interface SmsPayload {
  to: string;
  message: string;
}

export interface ISmsService {
  send(payload: SmsPayload): Promise<void>;
}

export const ISmsServiceToken = Symbol('ISmsService');
