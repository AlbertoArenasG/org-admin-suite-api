import { Inject, Injectable } from '@nestjs/common';
import type { IZipEntry } from 'adm-zip';
import * as AdmZipModule from 'adm-zip';
import { lookup as mimeLookup } from 'mime-types';
import * as path from 'path';

import {
  IngestServicePackageDto,
  IngestServicePackageResultDto,
  ParsedServicePackageDetailsDto,
  parseServicePackageDetails,
} from '@application/dto';
import { genId } from '@src/common/utils';
import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IFileStorageService,
  IFileStorageServiceToken,
} from '@domain/ports/services';
import {
  IServicePackageRecordWriteRepository,
  IServicePackageRecordWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  ServicePackageRecord,
  ServicePackageRecordFileProps,
} from '@domain/entities';

type AdmZipConstructor = new (input?: Buffer | string) => {
  getEntries(): IZipEntry[];
};

interface ParsedArchiveFile {
  relativePath: string;
  originalName: string;
  buffer: Buffer;
}

interface ParsedServiceFolder {
  folderPath: string;
  serviceOrder: string;
  details: ParsedServicePackageDetailsDto;
  files: ParsedArchiveFile[];
}

@Injectable()
export class IngestServicePackageUseCase {
  constructor(
    @Inject(IFileStorageServiceToken)
    private readonly fileStorageService: IFileStorageService,
    @Inject(IServicePackageRecordWriteRepositoryToken)
    private readonly servicePackageRecordWriteRepository: IServicePackageRecordWriteRepository,
  ) {}

  async execute(
    input: IngestServicePackageDto,
  ): Promise<IngestServicePackageResultDto> {
    const parsedFolders = this.extractServicesFromZip(input.buffer);

    if (parsedFolders.length === 0) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.SERVICE_PACKAGE_ARCHIVE,
      );
    }

    const packageId = genId(16);
    const response: IngestServicePackageResultDto = {
      packageId,
      services: [],
    };

    for (const folder of parsedFolders) {
      const recordId = genId(16);
      const folderKey = this.buildFolderKey(packageId, recordId);
      const uploadedFiles = await this.uploadFiles(folderKey, folder.files);

      const record = new ServicePackageRecord({
        id: recordId,
        packageId,
        serviceOrder: folder.serviceOrder,
        originalFilename: input.filename,
        s3FolderKey: folderKey,
        details: this.buildDetailsPayload(folder.details),
        company: folder.details.company,
        collectorName: folder.details.collectorName,
        contactPerson: folder.details.contactPerson,
        email: folder.details.email,
        phone: folder.details.phone,
        address: folder.details.address,
        visitDate: folder.details.visitDate,
        serviceType: folder.details.serviceType,
        purpose: folder.details.purpose,
        files: uploadedFiles,
        createdAt: new Date(),
      });

      const { data } =
        await this.servicePackageRecordWriteRepository.create(record);

      response.services.push({
        recordId: data?.id ?? recordId,
        serviceOrder: record.serviceOrder,
        fileCount: record.files.length,
      });
    }

    return response;
  }

  private buildDetailsPayload(details: ParsedServicePackageDetailsDto) {
    return {
      ...details,
      createdAt: details.createdAt,
    };
  }

  private async uploadFiles(
    folderKey: string,
    files: ParsedArchiveFile[],
  ): Promise<ServicePackageRecordFileProps[]> {
    const uploads = files.map(async (file) => {
      const normalizedPath = this.normalizeRelativePath(file.relativePath);
      const contentType = this.resolveMimeType(file.originalName);
      const key = `${folderKey}/${normalizedPath}`.replace(/\/+/g, '/');

      await this.fileStorageService.upload({
        key,
        body: file.buffer,
        contentType,
      });

      return {
        id: genId(),
        relativePath: normalizedPath,
        originalName: file.originalName,
        s3Key: key,
        size: file.buffer.length,
        contentType,
      };
    });

    return Promise.all(uploads);
  }

  private extractServicesFromZip(buffer: Buffer): ParsedServiceFolder[] {
    const zip = this.instantiateZip(buffer);

    const entries = zip.getEntries();
    const folderEntries = new Map<string, IZipEntry[]>();

    for (const entry of entries) {
      if (entry.isDirectory) {
        continue;
      }

      const normalizedName = this.normalizeEntryName(entry.entryName);

      if (
        !normalizedName ||
        normalizedName.startsWith('__MACOSX/') ||
        normalizedName === '__MACOSX'
      ) {
        continue;
      }

      const parentFolder = this.getParentFolder(normalizedName);

      if (!parentFolder) {
        continue;
      }

      const current = folderEntries.get(parentFolder) ?? [];
      current.push(entry);
      folderEntries.set(parentFolder, current);
    }

    const folders: ParsedServiceFolder[] = [];

    for (const [folderPath, folderFiles] of folderEntries.entries()) {
      const detailsResolution = this.findDetailsEntry(folderFiles);

      if (!detailsResolution) {
        continue;
      }

      const { entry: detailEntry, parsedDetails } = detailsResolution;
      const details = parsedDetails ?? this.parseDetails(detailEntry);
      const serviceOrder = details.serviceNumber;

      if (!serviceOrder) {
        throw InvalidValueException.create(
          InvalidValueExceptionCode.SERVICE_PACKAGE_DETAILS,
          { folder: folderPath },
        );
      }

      const files = folderFiles.map((entry) =>
        this.createArchiveFileDescriptor(folderPath, entry),
      );

      folders.push({
        folderPath,
        serviceOrder,
        details,
        files,
      });
    }

    if (folders.length === 0) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.SERVICE_PACKAGE_ARCHIVE,
      );
    }

    return folders;
  }

  private createArchiveFileDescriptor(
    folderPath: string,
    entry: IZipEntry,
  ): ParsedArchiveFile {
    const fullPath = this.normalizeEntryName(entry.entryName);
    const relativePath = fullPath.slice(folderPath.length + 1);
    const buffer = entry.getData();

    if (!relativePath) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.SERVICE_PACKAGE_ARCHIVE,
      );
    }

    return {
      relativePath,
      originalName: entry.entryName.split('/').pop() ?? entry.entryName,
      buffer,
    };
  }

  private parseDetails(entry: IZipEntry): ParsedServicePackageDetailsDto {
    try {
      const payload = entry.getData().toString('utf-8');
      return parseServicePackageDetails(payload);
    } catch {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.SERVICE_PACKAGE_DETAILS,
      );
    }
  }

  private isDetailsEntry(entryName: string): boolean {
    const normalized = this.normalizeEntryName(entryName).replace(
      /[\u0000-\u001f\u007f]/g,
      '',
    );
    const base = path.posix.basename(normalized).trim().toLowerCase();

    if (!base.endsWith('.json')) {
      return false;
    }

    if (base.startsWith('._')) {
      return false;
    }

    const nameWithoutExt = base.replace(/\.json$/, '');
    const acceptedNames = ['details', 'detalles'];

    return acceptedNames.includes(nameWithoutExt);
  }

  private findDetailsEntry(entries: IZipEntry[]): {
    entry: IZipEntry;
    parsedDetails?: ParsedServicePackageDetailsDto;
  } | null {
    const directMatch = entries.find((entry) =>
      this.isDetailsEntry(entry.entryName),
    );

    if (directMatch) {
      return { entry: directMatch };
    }

    for (const entry of entries) {
      if (!this.isJsonFile(entry.entryName)) {
        continue;
      }

      const parsed = this.tryParseDetails(entry);

      if (parsed) {
        return { entry, parsedDetails: parsed };
      }
    }

    return null;
  }

  private isJsonFile(entryName: string): boolean {
    const normalized = this.normalizeEntryName(entryName);

    if (!normalized) {
      return false;
    }

    const base = path.posix.basename(normalized).toLowerCase().trim();

    if (!base || base.startsWith('._')) {
      return false;
    }

    return base.endsWith('.json');
  }

  private tryParseDetails(
    entry: IZipEntry,
  ): ParsedServicePackageDetailsDto | null {
    try {
      return this.parseDetails(entry);
    } catch {
      return null;
    }
  }

  private instantiateZip(buffer: Buffer) {
    const moduleRef = AdmZipModule as unknown as {
      default?: unknown;
    };
    const maybeCtor: unknown =
      typeof moduleRef === 'function'
        ? moduleRef
        : typeof moduleRef?.default === 'function'
          ? moduleRef.default
          : undefined;

    if (typeof maybeCtor !== 'function') {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.SERVICE_PACKAGE_ARCHIVE,
      );
    }

    const ZipCtor = maybeCtor as AdmZipConstructor;

    try {
      return new ZipCtor(buffer);
    } catch {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.SERVICE_PACKAGE_ARCHIVE,
      );
    }
  }

  private getParentFolder(entryName: string): string {
    const normalized = this.normalizeEntryName(entryName);
    const parent = path.posix.dirname(normalized);

    if (
      !parent ||
      parent === '.' ||
      parent === '__MACOSX' ||
      parent.startsWith('__MACOSX/')
    ) {
      return '';
    }

    return parent;
  }

  private normalizeEntryName(entryName: string): string {
    return entryName
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');
  }

  private normalizeRelativePath(relativePath: string): string {
    return relativePath
      .split('/')
      .filter((segment) => segment && segment !== '.' && segment !== '..')
      .join('/');
  }

  private buildFolderKey(packageId: string, recordId: string): string {
    return `service-packages/${packageId}/${recordId}`;
  }

  private resolveMimeType(filename: string): string {
    return mimeLookup(filename) || 'application/octet-stream';
  }
}
