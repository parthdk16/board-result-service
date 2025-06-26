import { IsEnum, IsString, IsOptional, IsNumber, IsObject, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BoardType, ClassGrade, ResultStatus, SubjectMarks } from '../entities/result.entity';

export class CreateResultDto {
  @ApiProperty({ description: 'Student ID from user service' })
  @IsString()
  studentId: string;

  @ApiProperty({ enum: BoardType, description: 'Type of educational board' })
  @IsEnum(BoardType)
  boardType: BoardType;

  @ApiProperty({ enum: ClassGrade, description: 'Class or grade level' })
  @IsEnum(ClassGrade)
  classGrade: ClassGrade;

  @ApiProperty({ description: 'Academic year (e.g., 2023-2024)' })
  @IsString()
  academicYear: string;

  @ApiProperty({ description: 'Student roll number' })
  @IsString()
  rollNumber: string;

  @ApiProperty({ description: 'Registration number', required: false })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiProperty({ description: 'School code', required: false })
  @IsOptional()
  @IsString()
  schoolCode?: string;

  @ApiProperty({ description: 'School name', required: false })
  @IsOptional()
  @IsString()
  schoolName?: string;

  @ApiProperty({ enum: ResultStatus, description: 'Result status', required: false })
  @IsOptional()
  @IsEnum(ResultStatus)
  resultStatus?: ResultStatus;

  @ApiProperty({ description: 'Total marks', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalMarks?: number;

  @ApiProperty({ description: 'Obtained marks', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  obtainedMarks?: number;

  @ApiProperty({ description: 'Percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @ApiProperty({ description: 'Grade (A+, A, B+, etc.)', required: false })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ description: 'Division (First, Second, Third)', required: false })
  @IsOptional()
  @IsString()
  division?: string;

  @ApiProperty({ description: 'Subject-wise marks', required: false })
  @IsOptional()
  @IsObject()
  subjectMarks?: SubjectMarks;

  @ApiProperty({ description: 'Whether to publish immediately', required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
