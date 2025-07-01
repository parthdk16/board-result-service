// src/result/dto/create-student.dto.ts
import { IsString, IsEmail, IsUUID, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @Length(1, 50)
  userId: string;

  @IsString()
  @Length(1, 50)
  rollNumber: string;

  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  class?: string;

  @IsUUID()
  academicYearId: string;

  @IsOptional()
  @IsUUID()
  classLevelId?: string;

  @IsOptional()
  @IsUUID()
  streamId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  rollNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  class?: string;

  @IsOptional()
  @IsUUID()
  classLevelId?: string;

  @IsOptional()
  @IsUUID()
  streamId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
