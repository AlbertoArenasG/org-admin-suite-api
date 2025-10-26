import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { SubmitServiceEntrySurveyDto } from '@application/dto';
import { ServiceEntrySurveyQuestionType } from '@domain/entities';

class SurveyAnswerRequestDto {
  @IsString()
  question_id!: string;

  @IsIn(Object.values(ServiceEntrySurveyQuestionType))
  type!: ServiceEntrySurveyQuestionType;

  @IsOptional()
  value?: string | number | boolean | null;
}

export class SubmitServiceEntrySurveyRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SurveyAnswerRequestDto)
  answers!: SurveyAnswerRequestDto[];

  @IsOptional()
  @IsString()
  observations?: string | null;

  toDomain(token: string): SubmitServiceEntrySurveyDto {
    return {
      token,
      answers: this.answers.map((answer) => ({
        questionId: answer.question_id,
        type: answer.type,
        value: answer.value ?? null,
      })),
      observations: this.observations ?? null,
    };
  }
}
