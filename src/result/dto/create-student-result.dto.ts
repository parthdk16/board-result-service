// src/result/dto/create-student-result.dto.ts
import { IsUUID, IsNumber, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubjectResultDto {
  @IsUUID()
  academicYearSubjectId: string;

  @IsNumber()
  @Min(0)
  marksObtained: number;

  @IsNumber()
  @Min(1)
  maxMarks: number;
}

export class CreateStudentResultDto {
  @IsUUID()
  examinationId: string;

  @IsUUID()
  studentId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalMarksObtained?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalMaxMarks?: number = 0;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  resultStatus?: string = 'PENDING';

  @IsOptional()
  @IsNumber()
  @Min(1)
  overallRank?: number;

  @IsOptional()
  @Type(() => CreateSubjectResultDto)
  subjectResults?: CreateSubjectResultDto[];
}

export class UpdateStudentResultDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalMarksObtained?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalMaxMarks?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  resultStatus?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  overallRank?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
