import { DomainEvent } from '@src/internal/core/events';

export class EntityCreatedEvent extends DomainEvent<any> {
  constructor(entity: any) {
    super(`${entity.name}.created`, entity);
  }
}
