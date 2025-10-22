import { Matches, IsString } from 'class-validator';

export class PhoneRequestDto {
  @IsString()
  @Matches(/^\+\d{1,4}$/)
  country_code?: string | null = null;

  @IsString()
  @Matches(/^\d{7,15}$/)
  number?: string | null = null;
}
