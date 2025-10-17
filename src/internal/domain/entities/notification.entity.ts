import { Entity } from '@src/internal/core/entities/entity';
import { EntityCreatedEvent } from '@domain/events';

export interface NotificationProps {
  id?: string;
  type: NotificationType;
  channels: NotificationChannel[];
}

export class Notification extends Entity<NotificationProps> {
  constructor(props: NotificationProps) {
    super(props);
    this.apply(new EntityCreatedEvent(this));
  }
}

export enum NotificationType {
  WELCOME_USER = 'WELCOME_USER',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}
