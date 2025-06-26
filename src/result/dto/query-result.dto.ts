import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BoardType, ClassGrade, ResultStatus } from '../entities/result.entity';

export class QueryResultDto {
  @ApiProperty({ description: 'Student ID', required: false })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({ enum: BoardType, description: 'Board type', required: false })
  @IsOptional()
  @IsEnum(BoardType)
  boardType?: BoardType;

  @ApiProperty({ enum: ClassGrade, description: 'Class grade', required: false })
  @IsOptional()
  @IsEnum(ClassGrade)
  classGrade?: ClassGrade;

  @ApiProperty({ description: 'Academic year', required: false })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({ description: 'Roll number', required: false })
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiProperty({ enum: ResultStatus, description: 'Result status', required: false })
  @IsOptional()
  @IsEnum(ResultStatus)
  resultStatus?: ResultStatus;

  @ApiProperty({ description: 'Published status', required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsOptional()
  limit?: number = 10;
}
