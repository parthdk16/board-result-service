import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export class CreateAcademicYearDto {
  @IsString()
  yearLabel: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isCurrent?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateAcademicYearDto extends PartialType(CreateAcademicYearDto) {}
