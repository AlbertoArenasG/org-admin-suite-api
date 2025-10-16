export abstract class DomainEvent<Payload = unknown> {
  readonly id = crypto.randomUUID();
  readonly occurredOn = new Date();

  protected constructor(
    public readonly name: string,
    public readonly payload: Payload,
  ) {}
}
