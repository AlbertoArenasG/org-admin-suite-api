import { Provider } from '@domain/entities';

export interface IProviderWriteRepository {
  create(provider: Provider): Promise<{ data: Provider | null }>;
  update(provider: Provider): Promise<{ data: Provider | null }>;
}

export const IProviderWriteRepositoryToken = Symbol('IProviderWriteRepository');
