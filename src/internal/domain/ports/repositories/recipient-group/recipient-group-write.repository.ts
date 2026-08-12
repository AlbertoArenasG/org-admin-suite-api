import { RecipientGroup } from '@domain/entities';

export interface IRecipientGroupWriteRepository {
  create(
    recipientGroup: RecipientGroup,
  ): Promise<{ data: RecipientGroup | null }>;
  update(
    recipientGroup: RecipientGroup,
  ): Promise<{ data: RecipientGroup | null }>;
}

export const IRecipientGroupWriteRepositoryToken = Symbol(
  'IRecipientGroupWriteRepository',
);
