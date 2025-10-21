import Handlebars from 'handlebars';
import { NotificationType } from '@domain/entities';

export type NotificationTemplateRegistry = Record<
  NotificationType,
  Handlebars.TemplateDelegate
>;
