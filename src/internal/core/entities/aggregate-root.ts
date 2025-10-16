import { DomainEvent } from '../events';
import { Entity } from './entity';

export abstract class AggregateRoot<Props> extends Entity<Props> {
  private readonly domainEvents: DomainEvent[] = [];

  protected apply(event: DomainEvent) {
    this.domainEvents.push(event);
  }

  pullDomainEvents() {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }
}
