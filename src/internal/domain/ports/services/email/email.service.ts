export enum EmailTemplate {
  WELCOME_USER = 'welcome-user',
}

export interface EmailPayload {
  to: string;
  subject: string;
  template: EmailTemplate;
  context: Record<string, unknown>;
}

export interface IEmailService {
  send(payload: EmailPayload): Promise<void>;
}

export const IEmailServiceToken = Symbol('IEmailService');
