import {
  IsArray,
  ArrayUnique,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { ServiceEntryCategory } from '@domain/entities';
import { CreateServiceEntryDto } from '@application/dto';

export class CreateServiceEntryRequestDto {
  @IsNotEmpty()
  @IsString()
  company_name!: string;

  @IsNotEmpty()
  @IsString()
  contact_name!: string;

  @IsNotEmpty()
  @IsEmail()
  contact_email!: string;

  @IsNotEmpty()
  @IsString()
  service_order_identifier!: string;

  @IsNotEmpty()
  @IsEnum(ServiceEntryCategory)
  category_id!: ServiceEntryCategory;

  @IsNotEmpty()
  @IsString()
  calibration_certificate_file_id!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  attachment_file_ids?: string[];

  toDomain(): CreateServiceEntryDto {
    return {
      companyName: this.company_name,
      contactName: this.contact_name,
      contactEmail: this.contact_email,
      serviceOrderIdentifier: this.service_order_identifier,
      category: this.category_id,
      calibrationCertificateFileId: this.calibration_certificate_file_id,
      attachmentFileIds: this.attachment_file_ids ?? [],
    };
  }
}
