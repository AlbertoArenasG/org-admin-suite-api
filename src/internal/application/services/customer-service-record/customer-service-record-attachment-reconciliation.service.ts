import { Inject, Injectable } from '@nestjs/common';

import {
  CustomerServiceRecord,
  CustomerServiceRecordFileAttachmentCollectionProps,
  CustomerServiceRecordFileAttachmentProps,
} from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';

export interface ReconcileCustomerServiceRecordAttachmentsInput {
  collection: CustomerServiceRecordFileAttachmentCollectionProps;
  fileIds: string[];
  actorUserId: string;
}

@Injectable()
export class CustomerServiceRecordAttachmentReconciliationService {
  constructor(
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
  ) {}

  async reconcile(
    input: ReconcileCustomerServiceRecordAttachmentsInput,
  ): Promise<CustomerServiceRecordFileAttachmentCollectionProps> {
    const activeByFileId = this.groupByFileId(input.collection.files);
    const retained = new Set<CustomerServiceRecordFileAttachmentProps>();
    const unresolvedFileIds: string[] = [];
    const files = input.fileIds.map((fileId) => {
      const existing = activeByFileId.get(fileId)?.shift();
      if (existing) {
        retained.add(existing);
        return existing;
      }
      unresolvedFileIds.push(fileId);
      return null;
    });

    const newFilesById = await this.loadNewFiles(unresolvedFileIds);
    const addedAt = new Date();
    const reconciledFiles = files.map((file, index) => {
      if (file) return file;

      const fileId = input.fileIds[index];
      const newFile = newFilesById.get(fileId);
      if (!newFile)
        throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
          fileId,
        });

      return {
        fileId: newFile.id,
        originalName: newFile.originalName,
        mimeType: newFile.mimeType,
        size: newFile.size,
        addedAt,
        addedBy: input.actorUserId,
      };
    });

    const removedAt = new Date();
    const removedFiles = [
      ...input.collection.removedFiles,
      ...input.collection.files
        .filter((file) => !retained.has(file))
        .map((file) => ({
          ...file,
          removedAt,
          removedBy: input.actorUserId,
        })),
    ];

    return {
      files: reconciledFiles,
      removedFiles,
    };
  }

  calculateCounts(record: CustomerServiceRecord): {
    attachmentsCount: number;
    customerVisibleAttachmentsCount: number;
  } {
    const collections = [
      ...record.assets.flatMap((asset) => [
        asset.intakeConditionFiles!,
        asset.deliveryConditionFiles!,
        asset.reports!,
      ]),
      record.quotation,
      record.purchaseOrder,
      record.invoice,
      record.otherFiles,
    ];
    const attachmentsCount = collections.reduce(
      (count, collection) => count + collection.files.length,
      0,
    );

    return {
      attachmentsCount,
      customerVisibleAttachmentsCount: attachmentsCount,
    };
  }

  private async loadNewFiles(fileIds: string[]) {
    if (fileIds.length === 0) return new Map();

    const { data } = await this.fileReadRepository.findManyByIds([
      ...new Set(fileIds),
    ]);
    const filesById = new Map(data.map((file) => [file.id, file]));

    for (const fileId of fileIds) {
      if (!filesById.has(fileId))
        throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
          fileId,
        });
    }

    return filesById;
  }

  private groupByFileId(
    files: CustomerServiceRecordFileAttachmentProps[],
  ): Map<string, CustomerServiceRecordFileAttachmentProps[]> {
    const filesById = new Map<
      string,
      CustomerServiceRecordFileAttachmentProps[]
    >();

    for (const file of files) {
      const matches = filesById.get(file.fileId) ?? [];
      matches.push(file);
      filesById.set(file.fileId, matches);
    }

    return filesById;
  }
}
