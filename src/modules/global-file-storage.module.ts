import { Global, Module } from '@nestjs/common';

import { IFileStorageServiceToken } from '@domain/ports/services';
import { S3FileStorageService } from '@infra/services';

@Global()
@Module({
  providers: [
    {
      provide: IFileStorageServiceToken,
      useClass: S3FileStorageService,
    },
  ],
  exports: [IFileStorageServiceToken],
})
export class GlobalFileStorageModule {}
