// dto/query-result.dto.ts
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BoardType, ResultStatus } from '../entities_old/result.entity';

export class QueryResultDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Student ID must be a valid UUID' })
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by student name (partial match)',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  studentName?: string;

  @ApiPropertyOptional({
    description: 'Filter by roll number (partial match)',
    example: 'ROLL001',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  rollNumber?: string;

  @ApiPropertyOptional({
    description: 'Filter by board type',
    enum: BoardType,
    example: BoardType.CBSE,
  })
  @IsOptional()
  @IsEnum(BoardType, {
    message: 'Board type must be one of: CBSE, ICSE, STATE, IGCSE, IB',
  })
  boardType?: BoardType;

  @ApiPropertyOptional({
    description: 'Filter by class/grade',
    example: '10',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  classGrade?: string;

  @ApiPropertyOptional({
    description: 'Filter by academic year',
    example: '2023-24',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Filter by school name (partial match)',
    example: 'ABC Public School',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  schoolName?: string;

  @ApiPropertyOptional({
    description: 'Filter by result status',
    enum: ResultStatus,
    example: ResultStatus.PASS,
  })
  @IsOptional()
  @IsEnum(ResultStatus, {
    message:
      'Result status must be one of: PASS, FAIL, PENDING, ABSENT, WITHHELD',
  })
  resultStatus?: ResultStatus;

  @ApiPropertyOptional({
    description: 'Filter by publication status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean({ message: 'isPublished must be a boolean value' })
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by minimum percentage',
    example: 60,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum percentage must be a number' })
  @Min(0, { message: 'Minimum percentage cannot be less than 0' })
  @Max(100, { message: 'Minimum percentage cannot exceed 100' })
  minPercentage?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum percentage',
    example: 90,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum percentage must be a number' })
  @Min(0, { message: 'Maximum percentage cannot be less than 0' })
  @Max(100, { message: 'Maximum percentage cannot exceed 100' })
  maxPercentage?: number;

  @ApiPropertyOptional({
    description: 'Filter by overall grade',
    example: 'A+',
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'F'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['A+', 'A', 'B+', 'B', 'C+', 'C', 'F'], {
    message: 'Grade must be one of: A+, A, B+, B, C+, C, F',
  })
  overallGrade?: string;

  @ApiPropertyOptional({
    description: 'Filter by exam name',
    example: 'Annual Examination',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  examName?: string;

  @ApiPropertyOptional({
    description: 'Filter by created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Created by must be a valid UUID' })
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: [
      'createdAt',
      'updatedAt',
      'percentage',
      'studentName',
      'rollNumber',
      'academicYear',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn(
    [
      'createdAt',
      'updatedAt',
      'percentage',
      'studentName',
      'rollNumber',
      'academicYear',
    ],
    {
      message:
        'Sort field must be one of: createdAt, updatedAt, percentage, studentName, rollNumber, academicYear',
    },
  )
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'], { message: 'Sort order must be either ASC or DESC' })
  @Transform(({ value }) => value?.toString().toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Search term for general search across multiple fields',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter results from a specific date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter results up to a specific date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;
}

// import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsOptional,
//   IsString,
//   IsNumber,
//   IsBoolean,
//   IsUUID,
//   Min,
//   Max,
// } from 'class-validator';
// import { Type, Transform } from 'class-transformer';

// export class QueryResultDto {
//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsUUID(4)
//   studentId?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   studentRegNo?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   semester?: number;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   academicYear?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   course?: string;

//   @ApiProperty({ required: false, default: true })
//   @IsOptional()
//   @Transform(({ value }) => value === 'true' || value === true)
//   @IsBoolean()
//   publishedOnly?: boolean = true;

//   @ApiProperty({ required: false, default: 1 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   @Min(1)
//   page?: number = 1;

//   @ApiProperty({ required: false, default: 10 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   @Min(1)
//   @Max(100)
//   limit?: number = 10;
// }

// // import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
// // import { ApiProperty } from '@nestjs/swagger';
// // import { BoardType, ClassGrade, ResultStatus } from '../entities/result.entity';

// // export class QueryResultDto {
// //   @ApiProperty({ description: 'Student ID', required: false })
// //   @IsOptional()
// //   @IsString()
// //   studentId?: string;

// //   @ApiProperty({ enum: BoardType, description: 'Board type', required: false })
// //   @IsOptional()
// //   @IsEnum(BoardType)
// //   boardType?: BoardType;

// //   @ApiProperty({ enum: ClassGrade, description: 'Class grade', required: false })
// //   @IsOptional()
// //   @IsEnum(ClassGrade)
// //   classGrade?: ClassGrade;

// //   @ApiProperty({ description: 'Academic year', required: false })
// //   @IsOptional()
// //   @IsString()
// //   academicYear?: string;

// //   @ApiProperty({ description: 'Roll number', required: false })
// //   @IsOptional()
// //   @IsString()
// //   rollNumber?: string;

// //   @ApiProperty({ enum: ResultStatus, description: 'Result status', required: false })
// //   @IsOptional()
// //   @IsEnum(ResultStatus)
// //   resultStatus?: ResultStatus;

// //   @ApiProperty({ description: 'Published status', required: false })
// //   @IsOptional()
// //   @IsBoolean()
// //   isPublished?: boolean;

// //   @ApiProperty({ description: 'Page number', required: false, default: 1 })
// //   @IsOptional()
// //   page?: number = 1;

// //   @ApiProperty({ description: 'Items per page', required: false, default: 10 })
// //   @IsOptional()
// //   limit?: number = 10;
// // }
