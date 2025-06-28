import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardType } from '../entities/result.entity';

export class SubjectMarks {
  @ApiProperty({ description: 'Subject name' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Total marks for the subject' })
  @IsNumber()
  @Min(0)
  totalMarks: number;

  @ApiProperty({ description: 'Obtained marks for the subject' })
  @IsNumber()
  @Min(0)
  obtainedMarks: number;

  @ApiPropertyOptional({ description: 'Grade for the subject' })
  @IsString()
  @IsOptional()
  grade?: string;
}

export class CreateResultDto {
  @ApiProperty({
    description: 'UUID of the student',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Student ID must be a valid UUID' })
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Roll number of the student',
    example: 'ROLL001',
  })
  @IsString()
  @IsNotEmpty()
  // @Transform(({ value }) => value?.toString().trim().toUpperCase())
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value?.toString().trim().toUpperCase(),
  )
  rollNumber: string;

  @ApiProperty({
    description: 'Board type',
    enum: BoardType,
    example: BoardType.CBSE,
  })
  @IsEnum(BoardType, { message: 'Board type must be CBSE' })
  boardType: BoardType;

  @ApiProperty({
    description: 'Class/Grade of the student',
    example: '10',
  })
  @IsEnum(['10', '12'], { message: 'Class grade must be either 10 or 12' })
  classGrade: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2023-24',
  })
  @IsString()
  @IsNotEmpty()
  academicYear: string;

  @ApiPropertyOptional({
    description: 'Subject-wise marks breakdown',
    type: [SubjectMarks],
    example: [
      {
        subject: 'Mathematics',
        totalMarks: 100,
        obtainedMarks: 85,
        grade: 'A',
      },
      { subject: 'Science', totalMarks: 100, obtainedMarks: 78, grade: 'B+' },
    ],
  })
  @IsOptional()
  subjectWiseMarks?: SubjectMarks[];

  @ApiPropertyOptional({
    description: 'Additional remarks or comments',
    example: 'Excellent performance in Mathematics',
  })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({
    description: 'Whether the result should be published immediately',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Certificate number if available',
    example: 'CERT-2024-001',
  })
  @IsString()
  @IsOptional()
  certificateNumber?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata as JSON object',
    type: 'object',
    example: {
      schoolCode: 'SCH001',
      region: 'North',
      medium: 'English',
    },
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsNotEmpty()
  @IsString()
  studentName: string;

  @IsOptional()
  @IsNumber()
  totalMarks?: number;

  @IsOptional()
  @IsNumber()
  obtainedMarks?: number;

  @IsOptional()
  @IsString()
  resultStatus?: string;

  @IsOptional()
  @IsString()
  overallGrade?: string;

  @IsOptional()
  publishedAt?: Date | null;

  @IsOptional()
  @IsString()
  publishedBy?: string | null;
}

// import {
//   IsEnum,
//   IsString,
//   IsOptional,
//   IsNumber,
//   IsObject,
//   IsBoolean,
//   Min,
//   Max,
// } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';
// import {
//   BoardType,
//   ClassGrade,
//   ResultStatus,
//   SubjectMarks,
// } from '../entities/result.entity';

// export class CreateResultDto {
//   @ApiProperty({ description: 'Student ID from user service' })
//   @IsString()
//   studentId: string;

//   @ApiProperty({ enum: BoardType, description: 'Type of educational board' })
//   @IsEnum(BoardType)
//   boardType: BoardType;

//   @ApiProperty({ enum: ClassGrade, description: 'Class or grade level' })
//   @IsEnum(ClassGrade)
//   classGrade: ClassGrade;

//   @ApiProperty({ description: 'Academic year (e.g., 2023-2024)' })
//   @IsString()
//   academicYear: string;

//   @ApiProperty({ description: 'Student roll number' })
//   @IsString()
//   rollNumber: string;

//   @ApiProperty({ description: 'Registration number', required: false })
//   @IsOptional()
//   @IsString()
//   registrationNumber?: string;

//   @ApiProperty({ description: 'School code', required: false })
//   @IsOptional()
//   @IsString()
//   schoolCode?: string;

//   @ApiProperty({ description: 'School name', required: false })
//   @IsOptional()
//   @IsString()
//   schoolName?: string;

//   @ApiProperty({
//     enum: ResultStatus,
//     description: 'Result status',
//     required: false,
//   })
//   @IsOptional()
//   @IsEnum(ResultStatus)
//   resultStatus?: ResultStatus;

//   @ApiProperty({ description: 'Total marks', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   totalMarks?: number;

//   @ApiProperty({ description: 'Obtained marks', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   obtainedMarks?: number;

//   @ApiProperty({ description: 'Percentage', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   percentage?: number;

//   @ApiProperty({ description: 'Grade (A+, A, B+, etc.)', required: false })
//   @IsOptional()
//   @IsString()
//   grade?: string;

//   @ApiProperty({
//     description: 'Division (First, Second, Third)',
//     required: false,
//   })
//   @IsOptional()
//   @IsString()
//   division?: string;

//   @ApiProperty({ description: 'Subject-wise marks', required: false })
//   @IsOptional()
//   @IsObject()
//   subjectMarks?: SubjectMarks;

//   @ApiProperty({
//     description: 'Whether to publish immediately',
//     required: false,
//   })
//   @IsOptional()
//   @IsBoolean()
//   isPublished?: boolean;
// }
