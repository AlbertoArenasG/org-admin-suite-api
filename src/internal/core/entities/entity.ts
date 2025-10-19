import { recursivelyConvertToPrimitives } from '@src/common/utils';
import { DomainEvent } from '../events';

export abstract class Entity<Props> {
  private readonly domainEvents: DomainEvent[] = [];
  protected props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }

  protected apply(event: DomainEvent) {
    this.domainEvents.push(event);
  }

  pullDomainEvents() {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  public toPrimitives(): unknown {
    return recursivelyConvertToPrimitives(this.props);
  }
}
