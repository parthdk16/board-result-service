// src/result/dto/examination.dto.ts
import {
  IsUUID,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  Length,
} from 'class-validator';

export class CreateExaminationDto {
  @IsUUID()
  academicYearId: string;

  @IsUUID()
  @IsOptional()
  classLevelId?: string;

  @IsUUID()
  @IsOptional()
  streamId?: string;

  @IsString()
  @Length(1, 200)
  name: string;

  @IsString()
  @Length(1, 50)
  examType: string;

  @IsDateString()
  @IsOptional()
  examDate?: string;

  @IsDateString()
  @IsOptional()
  resultPublishedDate?: string;

  @IsBoolean()
  @IsOptional()
  isResultPublished?: boolean;

  @IsString()
  @IsOptional()
  class?: string;
}

export class UpdateExaminationDto extends CreateExaminationDto {}
