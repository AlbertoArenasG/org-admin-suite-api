import { Inject, Injectable } from '@nestjs/common';
import { basename } from 'path';

import { File, ServicePackageRecordFileProps } from '@domain/entities';
import {
  IFileStorageService,
  IFileStorageServiceToken,
} from '@domain/ports/services';
import { genId } from '@src/common/utils';

export interface ServicePackageConversionPhotoInput {
  equipmentIndex: number;
  photos: ServicePackageRecordFileProps[];
}

export interface ServicePackageConversionPhoto {
  equipmentIndex: number;
  file: File;
}

@Injectable()
export class ServicePackageConversionPhotoService {
  constructor(
    @Inject(IFileStorageServiceToken)
    private readonly storage: IFileStorageService,
  ) {}

  async prepare(input: {
    sourceRecordId: string;
    actorUserId: string;
    items: ServicePackageConversionPhotoInput[];
  }): Promise<ServicePackageConversionPhoto[]> {
    const references: ServicePackageConversionPhoto[] = [];
    const objects = new Map<string, { key: string; bucket: string }>();

    for (const item of input.items) {
      for (const photo of item.photos) {
        let object = objects.get(photo.s3Key);
        if (!object) {
          object = await this.storage.getObjectMetadata(photo.s3Key);
          objects.set(photo.s3Key, object);
        }

        references.push({
          equipmentIndex: item.equipmentIndex,
          file: new File({
            id: genId(),
            originalName: photo.originalName,
            filename: basename(photo.s3Key),
            mimeType: photo.contentType,
            size: photo.size,
            storageKey: object.key,
            bucket: object.bucket,
            url: null,
            uploadedBy: input.actorUserId,
            metadata: {
              source_service_package_record_id: input.sourceRecordId,
              source_file_id: photo.id ?? photo.s3Key,
            },
            createdAt: new Date(),
          }),
        });
      }
    }

    return references;
  }
}
