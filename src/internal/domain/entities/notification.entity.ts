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
  }

  get id(): string {
    return this.props.id;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get channels(): NotificationChannel[] {
    return this.props.channels;
  }

  get currentState(): NotificationProps {
    return this.props;
  }

  markAsCreated(): void {
    this.apply(new EntityCreatedEvent(this));
  }
}

export enum NotificationType {
  WELCOME_USER = 'WELCOME_USER',
  USER_REGISTRATION_INVITATION = 'USER_REGISTRATION_INVITATION',
  SERVICE_ENTRY_CREATED = 'SERVICE_ENTRY_CREATED',
  USER_PASSWORD_RESET = 'USER_PASSWORD_RESET',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}
