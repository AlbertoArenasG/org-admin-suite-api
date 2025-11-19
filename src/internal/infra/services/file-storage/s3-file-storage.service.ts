import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

import {
  GetObjectResult,
  IFileStorageService,
  UploadFileParams,
  UploadFileResult,
} from '@domain/ports/services';
import { EnvService } from '@infra/env/env.service';

@Injectable()
export class S3FileStorageService implements IFileStorageService {
  private readonly s3: S3;
  private readonly bucket: string;

  constructor(private readonly envService: EnvService) {
    this.bucket = this.envService.get('AWS_S3_BUCKET');
    this.s3 = new S3({
      region: this.envService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY'),
      },
      signatureVersion: 'v4',
    });
  }

  async upload(params: UploadFileParams): Promise<UploadFileResult> {
    await this.s3
      .putObject({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      })
      .promise();

    // TODO: Re-enable pre-signed URL generation if temporary public access is required.
    // const url = await this.s3.getSignedUrlPromise('getObject', {
    //   Bucket: this.bucket,
    //   Key: params.key,
    //   Expires: 3600,
    // });

    return {
      key: params.key,
      bucket: this.bucket,
      url: undefined,
    };
  }

  async getObject(key: string): Promise<GetObjectResult> {
    const response = await this.s3
      .getObject({
        Bucket: this.bucket,
        Key: key,
      })
      .promise();

    if (!response.Body) {
      throw new Error('File body is empty');
    }

    const stream = this.s3
      .getObject({ Bucket: this.bucket, Key: key })
      .createReadStream();

    return {
      stream,
      contentLength: response.ContentLength ?? undefined,
      contentType: response.ContentType ?? undefined,
    };
  }
}
