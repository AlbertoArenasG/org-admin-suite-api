import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

import { ConvertServicePackageRecordDto } from '@application/dto';

class ConversionCustomerRequestDto {
  @IsString() @IsNotEmpty() customer_id!: string;
  @IsArray() @IsString({ each: true }) customer_user_ids!: string[];
}

class ConversionAssetRequestDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() identifier!: string;
  @IsString() @IsNotEmpty() brand!: string;
  @IsString() @IsNotEmpty() model!: string;
  @IsString() @IsNotEmpty() serial_number!: string;
  @IsOptional() @IsString() observations?: string | null;
}

class ConversionItemRequestDto {
  @IsInt() @Min(0) equipment_index!: number;
  @IsDefined()
  @ValidateNested()
  @Type(() => ConversionCustomerRequestDto)
  customer!: ConversionCustomerRequestDto;
  @IsString() @IsNotEmpty() service_type_code!: string;
  @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) requested_at!: string;
  @IsOptional() @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) received_at?:
    | string
    | null;
  @IsDefined()
  @ValidateNested()
  @Type(() => ConversionAssetRequestDto)
  asset!: ConversionAssetRequestDto;
  @IsArray() @IsString({ each: true }) photo_file_ids!: string[];

  toDomain(): ConvertServicePackageRecordDto['records'][number] {
    return {
      equipmentIndex: this.equipment_index,
      customer: {
        customerId: this.customer.customer_id,
        customerUserIds: this.customer.customer_user_ids,
      },
      serviceTypeCode: this.service_type_code,
      requestedAt: this.requested_at,
      receivedAt: this.received_at,
      asset: {
        name: this.asset.name,
        identifier: this.asset.identifier,
        brand: this.asset.brand,
        model: this.asset.model,
        serialNumber: this.asset.serial_number,
        observations: this.asset.observations ?? null,
      },
      photoFileIds: this.photo_file_ids,
    };
  }
}

export class ConvertServicePackageRecordRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ConversionItemRequestDto)
  records!: ConversionItemRequestDto[];

  toDomain(
    sourceRecordId: string,
    actorUserId: string,
  ): ConvertServicePackageRecordDto {
    return {
      sourceRecordId,
      actorUserId,
      records: this.records.map((record) => record.toDomain()),
    };
  }
}
