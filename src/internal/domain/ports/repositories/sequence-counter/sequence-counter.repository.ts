export interface ISequenceCounterRepository {
  nextValue(key: string): Promise<number>;
}

export const ISequenceCounterRepositoryToken = Symbol(
  'ISequenceCounterRepository',
);
