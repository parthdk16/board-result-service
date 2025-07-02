// src/subjects/dto/subject.dto.ts
import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  @IsIn(['CORE', 'ELECTIVE', 'OPTIONAL', 'PRACTICAL'])
  subjectType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
