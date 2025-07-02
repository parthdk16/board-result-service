// src/academic-year-subjects/dto/academic-year-subject.dto.ts
import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateAcademicYearSubjectDto {
  @IsUUID()
  academicYearId: string;

  @IsUUID()
  subjectId: string;

  @IsOptional()
  @IsUUID()
  classLevelId?: string;

  @IsOptional()
  @IsUUID()
  streamId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  class?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  maxMarks?: number = 100;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minPassingMarks?: number = 33;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isCompulsory?: boolean = true;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  syllabusVersion?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean = true;
}

export class UpdateAcademicYearSubjectDto extends PartialType(
  CreateAcademicYearSubjectDto,
) {
  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;
}
