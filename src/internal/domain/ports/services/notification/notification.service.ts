export interface NotificationPayload {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

export interface INotificationService {
  send(payload: NotificationPayload): Promise<void>;
}

export const INotificationServiceToken = Symbol('INotificationService');
