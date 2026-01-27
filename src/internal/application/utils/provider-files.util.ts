import { extname } from 'node:path';

import { ProviderFiscalProfile, ProviderBankingInfo } from '@domain/entities';
import { File } from '@domain/entities/file.entity';
import { IFileReadRepository } from '@domain/ports/repositories';
import {
  ProviderFiscalProfileFilesMetadataDto,
  ProviderBankingInfoFilesMetadataDto,
  ProviderFileDescriptorDto,
} from '@application/dto';

export function createEmptyProviderFiscalProfileFilesMetadata(): ProviderFiscalProfileFilesMetadataDto {
  return {
    taxStatusCertificate: null,
    taxComplianceOpinion: null,
    addressProof: null,
  };
}

export function createEmptyProviderBankingInfoFilesMetadata(): ProviderBankingInfoFilesMetadataDto {
  return {
    bankStatement: null,
  };
}

export async function buildFilesMetadataForProviderFiscalProfiles(params: {
  profiles: ProviderFiscalProfile[];
  fileReadRepository: IFileReadRepository;
}): Promise<Map<string, ProviderFiscalProfileFilesMetadataDto>> {
  const { profiles, fileReadRepository } = params;
  const metadata = new Map<string, ProviderFiscalProfileFilesMetadataDto>();

  if (profiles.length === 0) {
    return metadata;
  }

  const fileIds = Array.from(
    new Set(
      profiles
        .flatMap((profile) => [
          profile.taxStatusCertificateFileId,
          profile.taxComplianceOpinionFileId,
          profile.addressProofFileId,
        ])
        .filter((fileId): fileId is string => !!fileId),
    ),
  );

  const filesById = new Map<string, File>();

  if (fileIds.length > 0) {
    const { data } = await fileReadRepository.findManyByIds(fileIds);
    data.forEach((file) => filesById.set(file.id, file));
  }

  profiles.forEach((profile) => {
    const descriptor = createEmptyProviderFiscalProfileFilesMetadata();

    if (profile.taxStatusCertificateFileId) {
      const file = filesById.get(profile.taxStatusCertificateFileId);
      descriptor.taxStatusCertificate = file ? toDescriptor(file) : null;
    }

    if (profile.taxComplianceOpinionFileId) {
      const file = filesById.get(profile.taxComplianceOpinionFileId);
      descriptor.taxComplianceOpinion = file ? toDescriptor(file) : null;
    }

    if (profile.addressProofFileId) {
      const file = filesById.get(profile.addressProofFileId);
      descriptor.addressProof = file ? toDescriptor(file) : null;
    }

    metadata.set(profile.id, descriptor);
  });

  return metadata;
}

export async function buildFilesMetadataForProviderBankingInfos(params: {
  bankingInfos: ProviderBankingInfo[];
  fileReadRepository: IFileReadRepository;
}): Promise<Map<string, ProviderBankingInfoFilesMetadataDto>> {
  const { bankingInfos, fileReadRepository } = params;
  const metadata = new Map<string, ProviderBankingInfoFilesMetadataDto>();

  if (bankingInfos.length === 0) {
    return metadata;
  }

  const fileIds = Array.from(
    new Set(
      bankingInfos
        .map((info) => info.bankStatementFileId)
        .filter((fileId): fileId is string => !!fileId),
    ),
  );

  const filesById = new Map<string, File>();

  if (fileIds.length > 0) {
    const { data } = await fileReadRepository.findManyByIds(fileIds);
    data.forEach((file) => filesById.set(file.id, file));
  }

  bankingInfos.forEach((info) => {
    const descriptor = createEmptyProviderBankingInfoFilesMetadata();

    if (info.bankStatementFileId) {
      const file = filesById.get(info.bankStatementFileId);
      descriptor.bankStatement = file ? toDescriptor(file) : null;
    }

    metadata.set(info.id, descriptor);
  });

  return metadata;
}

function toDescriptor(file: File): ProviderFileDescriptorDto {
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
