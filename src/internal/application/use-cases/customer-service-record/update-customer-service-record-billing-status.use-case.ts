import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateCustomerServiceRecordBillingStatusDto,
  UpdateCustomerServiceRecordBillingStatusResultDto,
} from '@application/dto';
import { CustomerServiceRecordMapper } from '@application/mappers';
import {
  CustomerServiceRecord,
  CustomerServiceRecordBillingNotificationStatus,
  CustomerServiceRecordBillingStatus,
} from '@domain/entities';
import {
  BillingNotificationDeliveryException,
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
  StateConflictException,
  StateConflictExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerServiceRecordReadRepository,
  ICustomerServiceRecordReadRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  ICustomerServiceRecordBillingNoticeSender,
  ICustomerServiceRecordBillingNoticeSenderToken,
} from '@domain/ports/services';

@Injectable()
export class UpdateCustomerServiceRecordBillingStatusUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    @Inject(ICustomerServiceRecordBillingNoticeSenderToken)
    private readonly noticeSender: ICustomerServiceRecordBillingNoticeSender,
  ) {}

  async execute(
    input: UpdateCustomerServiceRecordBillingStatusDto,
  ): Promise<UpdateCustomerServiceRecordBillingStatusResultDto> {
    if (
      !Object.values(CustomerServiceRecordBillingStatus).includes(
        input.billingStatus,
      )
    ) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'billing_status',
        value: input.billingStatus,
      });
    }
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    }

    const previousStatus = record.billingStatus;
    if (previousStatus === input.billingStatus) {
      return CustomerServiceRecordMapper.toViewDto(record);
    }

    if (input.billingStatus !== CustomerServiceRecordBillingStatus.SUBMITTED) {
      record.updateBilling(
        input.billingStatus,
        record.billingNotification,
        input.actorUserId,
      );
      return this.persistStatus(record, previousStatus);
    }

    const attemptedAt = new Date();
    try {
      await this.noticeSender.send({
        serviceNumberDisplay: record.serviceNumberDisplay,
        customerName: record.customer.customerName,
        assets: record.assets.map((asset) => ({
          name: asset.name,
          identifier: asset.identifier,
          brand: asset.brand,
          model: asset.model,
          serialNumber: asset.serialNumber,
          observations: asset.observations,
        })),
      });
    } catch {
      record.updateBillingNotification(
        {
          status: CustomerServiceRecordBillingNotificationStatus.FAILED,
          attemptedAt,
          sentAt: null,
          failureReason: 'EMAIL_SEND_FAILED',
        },
        input.actorUserId,
      );
      const { data } = await this.writeRepository.updateBillingNotification(
        record,
        previousStatus,
      );
      if (!data) throw this.statusChanged();
      throw BillingNotificationDeliveryException.deliveryFailed();
    }

    record.updateBilling(
      CustomerServiceRecordBillingStatus.SUBMITTED,
      {
        status: CustomerServiceRecordBillingNotificationStatus.SENT,
        attemptedAt,
        sentAt: new Date(),
        failureReason: null,
      },
      input.actorUserId,
    );
    return this.persistStatus(record, previousStatus);
  }

  private async persistStatus(
    record: CustomerServiceRecord,
    expectedStatus: CustomerServiceRecordBillingStatus,
  ): Promise<UpdateCustomerServiceRecordBillingStatusResultDto> {
    const { data } = await this.writeRepository.updateBillingStatus(
      record,
      expectedStatus,
    );
    if (!data) throw this.statusChanged();
    return CustomerServiceRecordMapper.toViewDto(data);
  }

  private statusChanged(): StateConflictException {
    return StateConflictException.create(
      StateConflictExceptionCode.CUSTOMER_SERVICE_RECORD_BILLING_STATUS_CHANGED,
    );
  }
}
