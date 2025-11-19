import { extname } from 'path';

import { CustomerFiscalProfile } from '@domain/entities';
import { File } from '@domain/entities/file.entity';
import { IFileReadRepository } from '@domain/ports/repositories';
import {
  CustomerFiscalProfileFilesMetadataDto,
  CustomerFiscalProfileFileDescriptorDto,
} from '@application/dto';

export function createEmptyCustomerFiscalProfileFilesMetadata(): CustomerFiscalProfileFilesMetadataDto {
  return {
    taxCertificate: null,
    invoiceRequirements: null,
  };
}

export async function buildFilesMetadataForProfiles(params: {
  profiles: CustomerFiscalProfile[];
  fileReadRepository: IFileReadRepository;
}): Promise<Map<string, CustomerFiscalProfileFilesMetadataDto>> {
  const { profiles, fileReadRepository } = params;
  const metadata = new Map<string, CustomerFiscalProfileFilesMetadataDto>();

  if (profiles.length === 0) {
    return metadata;
  }

  const fileIds = Array.from(
    new Set(
      profiles
        .map((profile) => [
          profile.taxCertificateFileId,
          profile.invoiceRequirementsFileId,
        ])
        .flat()
        .filter((fileId): fileId is string => !!fileId),
    ),
  );

  const filesById = new Map<string, File>();

  if (fileIds.length > 0) {
    const { data } = await fileReadRepository.findManyByIds(fileIds);
    data.forEach((file) => filesById.set(file.id, file));
  }

  profiles.forEach((profile) => {
    const descriptor = createEmptyCustomerFiscalProfileFilesMetadata();

    if (profile.taxCertificateFileId) {
      const file = filesById.get(profile.taxCertificateFileId);
      descriptor.taxCertificate = file ? toDescriptor(file) : null;
    }

    if (profile.invoiceRequirementsFileId) {
      const file = filesById.get(profile.invoiceRequirementsFileId);
      descriptor.invoiceRequirements = file ? toDescriptor(file) : null;
    }

    metadata.set(profile.id, descriptor);
  });

  return metadata;
}

export async function buildFilesMetadataForProfile(params: {
  profile: CustomerFiscalProfile;
  fileReadRepository: IFileReadRepository;
}): Promise<CustomerFiscalProfileFilesMetadataDto> {
  const map = await buildFilesMetadataForProfiles({
    profiles: [params.profile],
    fileReadRepository: params.fileReadRepository,
  });

  return (
    map.get(params.profile.id) ??
    createEmptyCustomerFiscalProfileFilesMetadata()
  );
}

function toDescriptor(file: File): CustomerFiscalProfileFileDescriptorDto {
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
