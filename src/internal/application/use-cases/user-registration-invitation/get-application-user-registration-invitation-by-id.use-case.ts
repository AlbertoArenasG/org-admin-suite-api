import { Inject, Injectable } from '@nestjs/common';

import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IUserRegistrationInvitationReadRepository,
  IUserRegistrationInvitationReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  ApplicationInvitationCustomerDto,
  ApplicationUserRegistrationInvitationDto,
} from '@application/dto';
import { Customer } from '@domain/entities';
import { UserRegistrationInvitationMapper } from '@application/mappers';

@Injectable()
export class GetApplicationUserRegistrationInvitationByIdUseCase {
  constructor(
    @Inject(IUserRegistrationInvitationReadRepositoryToken)
    private readonly invitationReadRepository: IUserRegistrationInvitationReadRepository,
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
  ) {}

  async execute(
    invitationId: string,
  ): Promise<ApplicationUserRegistrationInvitationDto> {
    const { data: invitation } =
      await this.invitationReadRepository.findApplicationInvitationById(
        invitationId,
      );

    if (!invitation) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.USER_REGISTRATION_INVITATION,
        { invitationId },
      );
    }

    const [roleName, customers] = await Promise.all([
      this.resolveRoleName(invitation.roleId),
      this.resolveCustomers(invitation.customerIds),
    ]);
    const result = UserRegistrationInvitationMapper.toApplicationDto(
      invitation,
      roleName,
      customers,
    );

    if (!result) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.USER_REGISTRATION_INVITATION,
        { invitationId },
      );
    }

    return result;
  }

  private async resolveRoleName(roleId: string | null): Promise<string | null> {
    if (!roleId) {
      return null;
    }

    const { data } = await this.roleReadRepository.findById(roleId);
    return data?.name ?? null;
  }

  private async resolveCustomers(
    customerIds: string[],
  ): Promise<ApplicationInvitationCustomerDto[]> {
    const { data } = await this.customerReadRepository.findByIds(customerIds);

    return data
      .map((customer) => this.toCustomerDto(customer))
      .sort(
        (first, second) =>
          first.companyName.localeCompare(second.companyName, 'es') ||
          first.id.localeCompare(second.id),
      );
  }

  private toCustomerDto(customer: Customer): ApplicationInvitationCustomerDto {
    return {
      id: customer.id,
      companyName: customer.companyName,
      status: customer.status,
    };
  }
}
