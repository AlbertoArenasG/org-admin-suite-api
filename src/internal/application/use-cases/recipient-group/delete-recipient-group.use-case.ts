import { Inject, Injectable } from '@nestjs/common';

import { DeleteRecipientGroupDto } from '@application/dto';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
  IRecipientGroupWriteRepository,
  IRecipientGroupWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class DeleteRecipientGroupUseCase {
  constructor(
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
    @Inject(IRecipientGroupWriteRepositoryToken)
    private readonly recipientGroupWriteRepository: IRecipientGroupWriteRepository,
  ) {}

  async execute(input: DeleteRecipientGroupDto): Promise<void> {
    const { data: recipientGroup } =
      await this.recipientGroupReadRepository.findById(input.recipientGroupId);

    if (!recipientGroup) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.RECIPIENT_GROUP,
        { recipientGroupId: input.recipientGroupId },
      );
    }

    recipientGroup.markAsDeleted(input.actorUserId);
    await this.recipientGroupWriteRepository.update(recipientGroup);
  }
}
