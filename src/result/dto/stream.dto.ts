// src/streams/dto/stream.dto.ts
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateStreamDto {
  @IsString()
  name: string;
}

export class UpdateStreamDto extends PartialType(CreateStreamDto) {}
