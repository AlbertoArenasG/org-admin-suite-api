import { Inject, Injectable } from '@nestjs/common';

import { GetExpirationNotificationPolicyByIdResultDto } from '@application/dto';
import { ExpirationNotificationPolicyMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import { RecipientGroup, RecipientGroupStatus } from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IExpirationNotificationPolicyReadRepository,
  IExpirationNotificationPolicyReadRepositoryToken,
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetExpirationNotificationPolicyByIdUseCase {
  constructor(
    @Inject(IExpirationNotificationPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationNotificationPolicyReadRepository,
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(
    expirationNotificationPolicyId: string,
  ): Promise<GetExpirationNotificationPolicyByIdResultDto> {
    const { data } = await this.readRepository.findById(
      expirationNotificationPolicyId,
    );

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.EXPIRATION_NOTIFICATION_POLICY,
        { expirationNotificationPolicyId },
      );
    }

    const recipientGroupIds = Array.from(
      new Set(data.rules.flatMap((rule) => rule.recipientGroupIds)),
    );
    const { data: recipientGroups } =
      await this.recipientGroupReadRepository.findByIds(recipientGroupIds);
    const recipientGroupsById = new Map(
      recipientGroups
        .filter(
          (recipientGroup) =>
            recipientGroup.status !== RecipientGroupStatus.DELETED,
        )
        .map((recipientGroup) => [recipientGroup.id, recipientGroup] as const),
    );

    const { createdByUser, updatedByUser } =
      await this.auditUserFetcher.fetchAuditUsers({
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      });

    return ExpirationNotificationPolicyMapper.toViewDto(
      data,
      recipientGroupsById as Map<string, RecipientGroup>,
      createdByUser,
      updatedByUser,
    );
  }
}
