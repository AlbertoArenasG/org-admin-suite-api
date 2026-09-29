import { IsIn, IsOptional } from 'class-validator';

export type ServicePackageRecordFileDownloadDisposition =
  | 'attachment'
  | 'inline';

export class ServicePackageRecordFileDownloadRequestDto {
  @IsOptional()
  @IsIn(['attachment', 'inline'])
  disposition?: ServicePackageRecordFileDownloadDisposition;

  get normalizedDisposition(): ServicePackageRecordFileDownloadDisposition {
    return this.disposition ?? 'attachment';
  }
}
