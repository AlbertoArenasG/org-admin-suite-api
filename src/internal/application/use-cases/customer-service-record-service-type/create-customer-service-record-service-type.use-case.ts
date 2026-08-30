import { Inject, Injectable } from '@nestjs/common';

import {
  CreateCustomerServiceRecordServiceTypeDto,
  CreateCustomerServiceRecordServiceTypeResultDto,
} from '@application/dto';
import { CustomerServiceRecordServiceTypeMapper } from '@application/mappers';
import { CustomerServiceRecordServiceType } from '@domain/entities';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerServiceRecordServiceTypeReadRepository,
  ICustomerServiceRecordServiceTypeReadRepositoryToken,
  ICustomerServiceRecordServiceTypeWriteRepository,
  ICustomerServiceRecordServiceTypeWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class CreateCustomerServiceRecordServiceTypeUseCase {
  constructor(
    @Inject(ICustomerServiceRecordServiceTypeReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordServiceTypeReadRepository,
    @Inject(ICustomerServiceRecordServiceTypeWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordServiceTypeWriteRepository,
  ) {}

  async execute(
    input: CreateCustomerServiceRecordServiceTypeDto,
  ): Promise<CreateCustomerServiceRecordServiceTypeResultDto> {
    const name = input.name.trim();
    const code = this.generateCode(name);
    if (!name || !code) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'name',
      });
    }
    const [{ data: sameName }, { data: sameCode }] = await Promise.all([
      this.readRepository.findByName(name),
      this.readRepository.findByCode(code),
    ]);

    if (sameName) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.CUSTOMER_SERVICE_RECORD_SERVICE_TYPE_NAME,
        { name },
      );
    }

    if (sameCode) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.CUSTOMER_SERVICE_RECORD_SERVICE_TYPE_CODE,
        { code },
      );
    }

    const serviceType = new CustomerServiceRecordServiceType({
      code,
      name,
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const { data } = await this.writeRepository.create(serviceType);

    return CustomerServiceRecordServiceTypeMapper.toDto(data!);
  }

  private generateCode(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_')
      .toUpperCase();
  }
}
