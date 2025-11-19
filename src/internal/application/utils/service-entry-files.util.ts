import { extname } from 'path';

import { ServiceEntry } from '@domain/entities';
import { File } from '@domain/entities/file.entity';
import { IFileReadRepository } from '@domain/ports/repositories';
import {
  ServiceEntryFilesMetadataDto,
  ServiceEntryFileDescriptorDto,
} from '@application/dto';

export function createEmptyServiceEntryFilesMetadata(): ServiceEntryFilesMetadataDto {
  return {
    calibrationCertificate: null,
    attachments: [],
  };
}

export async function buildFilesMetadataForEntries(params: {
  entries: ServiceEntry[];
  fileReadRepository: IFileReadRepository;
}): Promise<Map<string, ServiceEntryFilesMetadataDto>> {
  const { entries, fileReadRepository } = params;
  const result = new Map<string, ServiceEntryFilesMetadataDto>();

  if (entries.length === 0) {
    return result;
  }

  const fileIds = new Set<string>();
  for (const entry of entries) {
    if (entry.calibrationCertificateFileId) {
      fileIds.add(entry.calibrationCertificateFileId);
    }
    entry.attachmentFileIds.forEach((fileId) => fileIds.add(fileId));
  }

  const fileIdList = Array.from(fileIds);
  const filesById = new Map<string, File>();

  if (fileIdList.length > 0) {
    const { data } = await fileReadRepository.findManyByIds(fileIdList);
    data.forEach((file) => filesById.set(file.id, file));
  }

  entries.forEach((entry) => {
    const metadata = createEmptyServiceEntryFilesMetadata();

    if (entry.calibrationCertificateFileId) {
      const certificate = filesById.get(entry.calibrationCertificateFileId);
      metadata.calibrationCertificate = certificate
        ? toDescriptor(certificate)
        : null;
    }

    metadata.attachments = entry.attachmentFileIds
      .map((fileId) => filesById.get(fileId))
      .filter((file): file is File => !!file)
      .map(toDescriptor);

    result.set(entry.id, metadata);
  });

  return result;
}

export async function buildFilesMetadataForEntry(params: {
  entry: ServiceEntry;
  fileReadRepository: IFileReadRepository;
}): Promise<ServiceEntryFilesMetadataDto> {
  const map = await buildFilesMetadataForEntries({
    entries: [params.entry],
    fileReadRepository: params.fileReadRepository,
  });

  return map.get(params.entry.id) ?? createEmptyServiceEntryFilesMetadata();
}

function toDescriptor(file: File): ServiceEntryFileDescriptorDto {
  return {
    fileId: file.id,
    originalName: file.originalName,
    extension: extractExtension(file.originalName || file.filename),
  };
}

function extractExtension(filename: string): string {
  if (!filename) {
    return '';
  }

  const extension = extname(filename);

  if (!extension) {
    return '';
  }

  return extension.replace('.', '').toLowerCase();
}
