import { Inject, Injectable } from '@nestjs/common';

import {
  CreateCustomerFiscalProfileDto,
  CreateCustomerFiscalProfileResultDto,
} from '@application/dto';
import {
  ICustomerFiscalProfileWriteRepository,
  ICustomerFiscalProfileWriteRepositoryToken,
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  ICustomerWriteRepository,
  ICustomerWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { Customer, CustomerFiscalProfile } from '@domain/entities';
import { CustomerFiscalProfileMapper } from '@application/mappers';
import { genId } from '@src/common/utils';

@Injectable()
export class CreateCustomerFiscalProfileUseCase {
  constructor(
    @Inject(ICustomerFiscalProfileWriteRepositoryToken)
    private readonly profileWriteRepository: ICustomerFiscalProfileWriteRepository,
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
    @Inject(ICustomerWriteRepositoryToken)
    private readonly customerWriteRepository: ICustomerWriteRepository,
  ) {}

  async execute(
    input: CreateCustomerFiscalProfileDto,
  ): Promise<CreateCustomerFiscalProfileResultDto> {
    await this.ensureClientCodeUnique(input.clientCode);

    const token = this.generateToken();

    const customer = new Customer({
      companyName: input.companyName,
      clientCode: input.clientCode,
      accessToken: token,
      createdAt: new Date(),
    });

    const { data: createdCustomer } =
      await this.customerWriteRepository.create(customer);

    if (!createdCustomer) {
      throw new Error('Failed to create customer');
    }

    const profile = new CustomerFiscalProfile({
      customerId: createdCustomer.id,
      createdAt: new Date(),
    });

    const { data: createdProfile } =
      await this.profileWriteRepository.create(profile);

    if (!createdProfile) {
      throw new Error('Failed to create fiscal profile');
    }

    return CustomerFiscalProfileMapper.toCreateResultDto(
      createdCustomer,
      createdProfile,
    );
  }

  private async ensureClientCodeUnique(clientCode: string): Promise<void> {
    const { data } =
      await this.customerReadRepository.findByClientCode(clientCode);

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.CUSTOMER_FISCAL_PROFILE_CODE,
        { clientCode },
      );
    }
  }

  private generateToken(): string {
    return genId(36);
  }
}
