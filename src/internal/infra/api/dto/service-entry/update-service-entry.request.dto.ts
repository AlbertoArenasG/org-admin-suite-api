import {
  IsArray,
  ArrayUnique,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { ServiceEntryCategory } from '@domain/entities';
import { UpdateServiceEntryDto } from '@application/dto';

export class UpdateServiceEntryRequestDto {
  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  contact_name?: string;

  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @IsOptional()
  @IsString()
  service_order_identifier?: string;

  @IsOptional()
  @IsEnum(ServiceEntryCategory)
  category_id?: ServiceEntryCategory;

  @IsOptional()
  @IsString()
  calibration_certificate_file_id?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  attachment_file_ids?: string[];

  toDomain(id: string): UpdateServiceEntryDto {
    return {
      id,
      companyName: this.company_name,
      contactName: this.contact_name,
      contactEmail: this.contact_email,
      serviceOrderIdentifier: this.service_order_identifier,
      category: this.category_id,
      calibrationCertificateFileId: this.calibration_certificate_file_id,
      attachmentFileIds: this.attachment_file_ids,
    };
  }
}
