import { IsNotEmpty, IsString } from 'class-validator';

import { ContactValueDto } from '@application/dto';

export class ContactValueRequestDto {
  @IsNotEmpty()
  @IsString()
  value!: string;

  toDomain(): ContactValueDto {
    return {
      value: this.value,
    };
  }
}
