import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateBillingCustomerServiceRecordStatusDto,
  UpdateBillingCustomerServiceRecordStatusResultDto,
} from '@application/dto/customer-service-record-billing';
import { BillingCustomerServiceRecordMapper } from '@application/mappers/customer-service-record-billing';
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
  IBillingCustomerServiceRecordReadRepository,
  IBillingCustomerServiceRecordReadRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  ICustomerServiceRecordBillingNoticeSender,
  ICustomerServiceRecordBillingNoticeSenderToken,
} from '@domain/ports/services';

@Injectable()
export class UpdateBillingCustomerServiceRecordStatusUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: IBillingCustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    @Inject(ICustomerServiceRecordBillingNoticeSenderToken)
    private readonly noticeSender: ICustomerServiceRecordBillingNoticeSender,
  ) {}

  async execute(
    input: UpdateBillingCustomerServiceRecordStatusDto,
  ): Promise<UpdateBillingCustomerServiceRecordStatusResultDto> {
    if (
      input.billingStatus !== CustomerServiceRecordBillingStatus.SUBMITTED &&
      input.billingStatus !== CustomerServiceRecordBillingStatus.INVOICED
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
    if (
      previousStatus !== CustomerServiceRecordBillingStatus.SUBMITTED &&
      previousStatus !== CustomerServiceRecordBillingStatus.INVOICED
    ) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    }
    if (previousStatus === input.billingStatus) {
      return BillingCustomerServiceRecordMapper.toViewDto(record);
    }

    if (input.billingStatus === CustomerServiceRecordBillingStatus.INVOICED) {
      record.updateBilling(
        input.billingStatus,
        record.billingNotification,
        input.actorUserId,
      );
      return this.persistStatus(record, previousStatus);
    }

    const attemptedAt = new Date();
    let noticeSent = false;
    try {
      noticeSent = await this.noticeSender.send({
        attemptedAt,
        serviceNumberDisplay: record.serviceNumberDisplay,
        customerName: record.customer.customerName,
        requestedAt: record.requestedAt,
        createdAt: record.createdAt ?? null,
        assets: record.assets.map((asset) => ({
          name: asset.name,
          identifier: asset.identifier,
          brand: asset.brand,
          model: asset.model,
          serialNumber: asset.serialNumber,
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
      noticeSent
        ? {
            status: CustomerServiceRecordBillingNotificationStatus.SENT,
            attemptedAt,
            sentAt: new Date(),
            failureReason: null,
          }
        : {
            status:
              CustomerServiceRecordBillingNotificationStatus.NOT_REQUESTED,
            attemptedAt: null,
            sentAt: null,
            failureReason: null,
          },
      input.actorUserId,
    );
    return this.persistStatus(record, previousStatus);
  }

  private async persistStatus(
    record: CustomerServiceRecord,
    expectedStatus: CustomerServiceRecordBillingStatus,
  ): Promise<UpdateBillingCustomerServiceRecordStatusResultDto> {
    const { data } = await this.writeRepository.updateBillingStatus(
      record,
      expectedStatus,
    );
    if (!data) throw this.statusChanged();
    return BillingCustomerServiceRecordMapper.toViewDto(data);
  }

  private statusChanged(): StateConflictException {
    return StateConflictException.create(
      StateConflictExceptionCode.CUSTOMER_SERVICE_RECORD_BILLING_STATUS_CHANGED,
    );
  }
}
