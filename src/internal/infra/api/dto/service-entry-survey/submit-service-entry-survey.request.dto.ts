import { IsEnum, IsOptional, IsString } from 'class-validator';

import { SubmitServiceEntrySurveyDto } from '@application/dto';
import { ServiceEntrySurveyRating } from '@domain/entities';

export class SubmitServiceEntrySurveyRequestDto {
  @IsEnum(ServiceEntrySurveyRating)
  staff_treatment!: ServiceEntrySurveyRating;

  @IsEnum(ServiceEntrySurveyRating)
  response_time!: ServiceEntrySurveyRating;

  @IsEnum(ServiceEntrySurveyRating)
  appearance_attitude!: ServiceEntrySurveyRating;

  @IsEnum(ServiceEntrySurveyRating)
  documentation_delivery!: ServiceEntrySurveyRating;

  @IsOptional()
  @IsString()
  observations?: string | null;

  toDomain(token: string): SubmitServiceEntrySurveyDto {
    return {
      token,
      staffTreatment: this.staff_treatment,
      responseTime: this.response_time,
      appearanceAttitude: this.appearance_attitude,
      documentationDelivery: this.documentation_delivery,
      observations: this.observations ?? null,
    };
  }
}
