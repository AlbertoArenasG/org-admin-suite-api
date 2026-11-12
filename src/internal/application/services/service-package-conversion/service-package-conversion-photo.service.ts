import { Inject, Injectable, Logger } from '@nestjs/common';
import { extname } from 'path';

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

export interface CopiedServicePackagePhoto {
  equipmentIndex: number;
  file: File;
}

export interface ServicePackageConversionPhotos {
  copies: CopiedServicePackagePhoto[];
  keys: string[];
}

@Injectable()
export class ServicePackageConversionPhotoService {
  private readonly logger = new Logger(
    ServicePackageConversionPhotoService.name,
  );

  constructor(
    @Inject(IFileStorageServiceToken)
    private readonly storage: IFileStorageService,
  ) {}

  async copy(input: {
    sourceRecordId: string;
    actorUserId: string;
    items: ServicePackageConversionPhotoInput[];
  }): Promise<ServicePackageConversionPhotos> {
    const result: ServicePackageConversionPhotos = { copies: [], keys: [] };
    try {
      for (const item of input.items) {
        for (const photo of item.photos) {
          const fileId = genId();
          const filename = `${fileId}${extname(photo.originalName).toLowerCase()}`;
          const key = `uploads/${fileId}/${filename}`;
          // Include the key before the request: the acknowledgement may be lost after S3 copies it.
          result.keys.push(key);
          const stored = await this.storage.copyObject(photo.s3Key, key);
          result.copies.push({
            equipmentIndex: item.equipmentIndex,
            file: new File({
              id: fileId,
              originalName: photo.originalName,
              filename,
              mimeType: photo.contentType,
              size: photo.size,
              storageKey: stored.key,
              bucket: stored.bucket,
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
      return result;
    } catch (error) {
      await this.remove(result.keys);
      throw error;
    }
  }

  async remove(keys: string[]): Promise<void> {
    const results = await Promise.allSettled(
      keys.map((key) => this.storage.deleteObject(key)),
    );
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.warn(`Could not remove copied object ${keys[index]}`);
      }
    });
  }
}
