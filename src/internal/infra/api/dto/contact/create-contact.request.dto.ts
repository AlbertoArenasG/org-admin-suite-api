import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayUnique,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CreateContactDto } from '@application/dto';
import { ContactValueRequestDto } from './contact-value.request.dto';

export class CreateContactRequestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  lastname!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  company_names?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactValueRequestDto)
  emails?: ContactValueRequestDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactValueRequestDto)
  phones?: ContactValueRequestDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactValueRequestDto)
  cell_phones?: ContactValueRequestDto[];

  toDomain(actorUserId: string): CreateContactDto {
    return {
      actorUserId,
      name: this.name,
      lastname: this.lastname,
      companyNames: this.company_names ?? [],
      emails: this.emails?.map((item) => item.toDomain()) ?? [],
      phones: this.phones?.map((item) => item.toDomain()) ?? [],
      cellPhones: this.cell_phones?.map((item) => item.toDomain()) ?? [],
    };
  }
}
