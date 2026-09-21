import { IsIn, IsOptional, IsString } from 'class-validator';

export type FileDownloadDisposition = 'attachment' | 'inline';

export class DownloadFileRequestDto {
  @IsOptional() @IsString() service_entry_id?: string;
  @IsOptional()
  @IsIn(['attachment', 'inline'])
  disposition?: FileDownloadDisposition;

  get normalizedDisposition(): FileDownloadDisposition {
    return this.disposition ?? 'attachment';
  }
}
