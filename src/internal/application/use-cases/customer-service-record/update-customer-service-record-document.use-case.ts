import { Inject, Injectable } from '@nestjs/common';

import {
  CustomerServiceRecordDocumentProps,
  CustomerServiceRecordFileAttachmentCollectionProps,
} from '@domain/entities';
import {
  UpdateCustomerServiceRecordDocumentDto,
  UpdateCustomerServiceRecordDocumentResultDto,
} from '@application/dto';
import { CustomerServiceRecordMapper } from '@application/mappers';
import { CustomerServiceRecordAttachmentReconciliationService } from '@application/services';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerServiceRecordReadRepository,
  ICustomerServiceRecordReadRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class UpdateCustomerServiceRecordDocumentUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly attachmentReconciliation: CustomerServiceRecordAttachmentReconciliationService,
  ) {}

  async execute(
    input: UpdateCustomerServiceRecordDocumentDto,
  ): Promise<UpdateCustomerServiceRecordDocumentResultDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );

    this.assertReferenceNumberContract(input);
    const collection = this.getCollection(record, input.documentType);
    const reconciled = await this.attachmentReconciliation.reconcile({
      collection,
      fileIds: input.fileIds,
      actorUserId: input.actorUserId,
    });
    const referenceNumber = input.referenceNumber?.trim() || null;

    switch (input.documentType) {
      case 'quotation':
        record.updateDetails(
          { quotation: { ...reconciled, referenceNumber } },
          input.actorUserId,
        );
        break;
      case 'purchase-order':
        record.updateDetails(
          { purchaseOrder: { ...reconciled, referenceNumber } },
          input.actorUserId,
        );
        break;
      case 'invoice':
        record.updateDetails(
          { invoice: { ...reconciled, referenceNumber } },
          input.actorUserId,
        );
        break;
      case 'other-files':
        record.updateDetails({ otherFiles: reconciled }, input.actorUserId);
        break;
    }
    record.updateDetails(
      this.attachmentReconciliation.calculateCounts(record),
      input.actorUserId,
    );

    const { data } = await this.writeRepository.update(record);
    return CustomerServiceRecordMapper.toViewDto(data!);
  }

  private assertReferenceNumberContract(
    input: UpdateCustomerServiceRecordDocumentDto,
  ): void {
    const isOtherFiles = input.documentType === 'other-files';
    const isMissingReference = input.referenceNumber === undefined;
    if (
      (isOtherFiles && !isMissingReference) ||
      (!isOtherFiles && isMissingReference)
    )
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'reference_number',
        reason: isOtherFiles ? 'NOT_ALLOWED' : 'REQUIRED',
      });
  }

  private getCollection(
    record: {
      quotation: CustomerServiceRecordDocumentProps;
      purchaseOrder: CustomerServiceRecordDocumentProps;
      invoice: CustomerServiceRecordDocumentProps;
      otherFiles: CustomerServiceRecordFileAttachmentCollectionProps;
    },
    documentType: UpdateCustomerServiceRecordDocumentDto['documentType'],
  ): CustomerServiceRecordFileAttachmentCollectionProps {
    switch (documentType) {
      case 'quotation':
        return record.quotation;
      case 'purchase-order':
        return record.purchaseOrder;
      case 'invoice':
        return record.invoice;
      case 'other-files':
        return record.otherFiles;
      default:
        throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
          field: 'document_type',
          reason: 'INVALID_DOCUMENT_TYPE',
        });
    }
  }
}
