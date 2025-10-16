import { DomainEvent } from '@src/internal/core/events';
import { User } from '@domain/entities';

export class UserCreatedEvent extends DomainEvent<User> {
  constructor(user: User) {
    super('user.created', user);
  }
}
