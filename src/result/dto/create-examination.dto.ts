// src/result/dto/create-examination.dto.ts
import { IsString, IsUUID, IsOptional, IsDateString, IsBoolean, Length } from 'class-validator';

export class CreateExaminationDto {
  @IsUUID()
  academicYearId: string;

  @IsString()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  class?: string;

  @IsOptional()
  @IsUUID()
  classLevelId?: string;

  @IsOptional()
  @IsUUID()
  streamId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  examType?: string = 'ANNUAL';

  @IsOptional()
  @IsDateString()
  examDate?: string;

  @IsOptional()
  @IsDateString()
  resultPublishedDate?: string;

  @IsOptional()
  @IsBoolean()
  isResultPublished?: boolean = false;
}

export class UpdateExaminationDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  examType?: string;

  @IsOptional()
  @IsDateString()
  examDate?: string;

  @IsOptional()
  @IsDateString()
  resultPublishedDate?: string;

  @IsOptional()
  @IsBoolean()
  isResultPublished?: boolean;
}
