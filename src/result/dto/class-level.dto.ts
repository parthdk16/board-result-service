// src/class-levels/dto/class-level.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Length,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateClassLevelDto {
  @IsString()
  @Length(1, 10)
  level: string;
}

export class UpdateClassLevelDto extends PartialType(CreateClassLevelDto) {}
