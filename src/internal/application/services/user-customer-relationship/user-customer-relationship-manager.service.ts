import { Inject, Injectable } from '@nestjs/common';

import {
  SystemRole,
  User,
  UserCustomerRelationship,
  UserStatus,
} from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
  StateConflictException,
  StateConflictExceptionCode,
} from '@domain/exceptions';
import {
  IUserCustomerRelationshipReadRepository,
  IUserCustomerRelationshipReadRepositoryToken,
  IUserCustomerRelationshipWriteRepository,
  IUserCustomerRelationshipWriteRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  ITransactionalExecutor,
  ITransactionalExecutorToken,
} from '@domain/ports/services';

import { SyncUserContactService } from '../contact';
import { CustomerContextValidationService } from './customer-context-validation.service';
import { UserCustomerRelationshipValidationService } from './user-customer-relationship-validation.service';

@Injectable()
export class UserCustomerRelationshipManagerService {
  constructor(
    @Inject(IUserCustomerRelationshipReadRepositoryToken)
    private readonly relationshipReadRepository: IUserCustomerRelationshipReadRepository,
    @Inject(IUserCustomerRelationshipWriteRepositoryToken)
    private readonly relationshipWriteRepository: IUserCustomerRelationshipWriteRepository,
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(ITransactionalExecutorToken)
    private readonly transactionalExecutor: ITransactionalExecutor,
    private readonly customerContextValidationService: CustomerContextValidationService,
    private readonly relationshipValidationService: UserCustomerRelationshipValidationService,
    private readonly syncUserContactService: SyncUserContactService,
  ) {}

  async replaceForUser(params: {
    user: User;
    customerIds: string[];
  }): Promise<void> {
    await this.transactionalExecutor.execute(async () => {
      const { data: existingRelationships } =
        await this.relationshipReadRepository.findByUserId(params.user.id);
      const customerIds =
        await this.relationshipValidationService.validateCustomerIds(
          params.customerIds,
          params.user.systemRole,
          existingRelationships.map((relationship) => relationship.customerId),
        );

      await this.relationshipWriteRepository.replaceForUser(
        params.user.id,
        customerIds.map(
          (customerId) =>
            new UserCustomerRelationship({
              userId: params.user.id,
              customerId,
            }),
        ),
      );
      await this.synchronizeUserContact(params.user);
    });
  }

  async associate(params: {
    customerId: string;
    userId: string;
  }): Promise<User> {
    return this.transactionalExecutor.execute(async () => {
      await this.customerContextValidationService.ensureMutable(
        params.customerId,
      );
      const user = await this.findEligibleActiveUser(params.userId);
      const { data: existingRelationship } =
        await this.relationshipReadRepository.findByUserIdAndCustomerId(
          params.userId,
          params.customerId,
        );

      if (existingRelationship) {
        throw StateConflictException.create(
          StateConflictExceptionCode.USER_CUSTOMER_RELATIONSHIP_ALREADY_EXISTS,
          params,
        );
      }

      await this.relationshipWriteRepository.create(
        new UserCustomerRelationship({
          userId: params.userId,
          customerId: params.customerId,
        }),
      );
      await this.synchronizeUserContact(user);

      return user;
    });
  }

  async disassociate(params: {
    customerId: string;
    userId: string;
  }): Promise<User> {
    return this.transactionalExecutor.execute(async () => {
      await this.customerContextValidationService.ensureMutable(
        params.customerId,
      );
      const user = await this.findExistingUser(params.userId);
      const { deleted } =
        await this.relationshipWriteRepository.deleteByUserIdAndCustomerId(
          params.userId,
          params.customerId,
        );

      if (!deleted) {
        throw StateConflictException.create(
          StateConflictExceptionCode.USER_CUSTOMER_RELATIONSHIP_NOT_FOUND,
          params,
        );
      }

      await this.synchronizeUserContact(user);

      return user;
    });
  }

  private async findEligibleActiveUser(userId: string): Promise<User> {
    const user = await this.findExistingUser(userId);

    if (
      user.systemRole !== SystemRole.USER ||
      user.status !== UserStatus.ACTIVE
    ) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'user_id',
        userId,
      });
    }

    return user;
  }

  private async findExistingUser(userId: string): Promise<User> {
    const { data: user } = await this.userReadRepository.findById(userId);

    if (!user || user.status === UserStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    return user;
  }

  private async synchronizeUserContact(user: User): Promise<void> {
    await this.syncUserContactService.syncCompanyNamesForUsers([user.id]);
  }
}
