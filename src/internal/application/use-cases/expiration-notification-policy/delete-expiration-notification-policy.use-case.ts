import { Inject, Injectable } from '@nestjs/common';

import { DeleteExpirationNotificationPolicyDto } from '@application/dto';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IExpirationNotificationPolicyReadRepository,
  IExpirationNotificationPolicyReadRepositoryToken,
  IExpirationNotificationPolicyWriteRepository,
  IExpirationNotificationPolicyWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class DeleteExpirationNotificationPolicyUseCase {
  constructor(
    @Inject(IExpirationNotificationPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationNotificationPolicyReadRepository,
    @Inject(IExpirationNotificationPolicyWriteRepositoryToken)
    private readonly writeRepository: IExpirationNotificationPolicyWriteRepository,
  ) {}

  async execute(input: DeleteExpirationNotificationPolicyDto): Promise<void> {
    const { data } = await this.readRepository.findById(
      input.expirationNotificationPolicyId,
    );

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.EXPIRATION_NOTIFICATION_POLICY,
        {
          expirationNotificationPolicyId: input.expirationNotificationPolicyId,
        },
      );
    }

    data.markAsDeleted(input.actorUserId);
    await this.writeRepository.update(data);
  }
}
