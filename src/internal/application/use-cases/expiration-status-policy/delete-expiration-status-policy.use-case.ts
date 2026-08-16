import { Inject, Injectable } from '@nestjs/common';

import { DeleteExpirationStatusPolicyDto } from '@application/dto';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IExpirationStatusPolicyReadRepository,
  IExpirationStatusPolicyReadRepositoryToken,
  IExpirationStatusPolicyWriteRepository,
  IExpirationStatusPolicyWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class DeleteExpirationStatusPolicyUseCase {
  constructor(
    @Inject(IExpirationStatusPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationStatusPolicyReadRepository,
    @Inject(IExpirationStatusPolicyWriteRepositoryToken)
    private readonly writeRepository: IExpirationStatusPolicyWriteRepository,
  ) {}

  async execute(input: DeleteExpirationStatusPolicyDto): Promise<void> {
    const { data } = await this.readRepository.findById(
      input.expirationStatusPolicyId,
    );

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.EXPIRATION_STATUS_POLICY,
        { expirationStatusPolicyId: input.expirationStatusPolicyId },
      );
    }

    data.markAsDeleted(input.actorUserId);
    await this.writeRepository.update(data);
  }
}
