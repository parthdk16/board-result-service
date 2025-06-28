// dto/update-result.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateResultDto } from './create-result.dto';
import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResultDto extends PartialType(
  OmitType(CreateResultDto, ['studentId'] as const),
) {
  @ApiPropertyOptional({
    description: 'UUID of the student (can be updated with restrictions)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Student ID must be a valid UUID' })
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({
    description:
      'Student name (will be updated automatically if studentId changes)',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  studentName?: string;

  @ApiPropertyOptional({
    description: 'Whether to publish/unpublish the result',
    example: true,
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
    description: 'Published date (automatically set when publishing)',
    example: '2024-03-15T10:30:00Z',
  })
  @IsOptional()
  publishedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'UUID of the user who published the result',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Published by must be a valid UUID' })
  @IsOptional()
  publishedBy?: string | null;

  @ApiPropertyOptional({
    description:
      'Calculated percentage (automatically calculated if marks are provided)',
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  percentage?: number;

  @ApiPropertyOptional({
    description: 'Calculated CGPA (automatically calculated)',
    example: 9.0,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  cgpa?: number;

  @ApiPropertyOptional({
    description: 'Whether certificate has been generated',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  isCertificateGenerated?: boolean;

  @ApiPropertyOptional({
    description: 'UUID of the user who last updated the result',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Updated by must be a valid UUID' })
  @IsOptional()
  updatedBy?: string;
}

// import { PartialType } from '@nestjs/swagger';
// import { CreateResultDto } from './create-result.dto';

// export class UpdateResultDto extends PartialType(CreateResultDto) {}
