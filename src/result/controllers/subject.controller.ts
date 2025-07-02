// src/subjects/controllers/subject.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import { SubjectService } from '../services/subject.service';
import { CreateSubjectDto, UpdateSubjectDto } from '../dto/subject.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BaseResponseDto } from '../../common/dto/base-response.dto';

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createSubjectDto: CreateSubjectDto) {
    const subject = await this.subjectService.create(createSubjectDto);
    return BaseResponseDto.success('Subject created successfully', subject);
  }

  @Get()
  async findAll(
    @Query(ValidationPipe) pagination: PaginationDto,
    @Query() filters: any,
  ) {
    const [subjects, count] = await this.subjectService.findAll(
      pagination,
      filters,
    );
    return BaseResponseDto.success('Subjects retrieved successfully', {
      subjects,
      count,
      pagination: {
        page: Math.floor((pagination.skip ?? 0) / (pagination.limit ?? 10)) + 1,
        limit: pagination.limit,
        total: count,
      },
    });
  }

  @Get('active')
  async findAllActive() {
    const subjects = await this.subjectService.findAllActive();
    return BaseResponseDto.success(
      'Active subjects retrieved successfully',
      subjects,
    );
  }

  @Get('by-type/:type')
  async findBySubjectType(@Param('type') type: string) {
    const subjects = await this.subjectService.findBySubjectType(type);
    return BaseResponseDto.success(
      `${type} subjects retrieved successfully`,
      subjects,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const subject = await this.subjectService.findOne(id);
    return BaseResponseDto.success('Subject retrieved successfully', subject);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    const subject = await this.subjectService.findByCode(code);
    return BaseResponseDto.success('Subject retrieved successfully', subject);
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    const subject = await this.subjectService.findByName(name);
    return BaseResponseDto.success('Subject retrieved successfully', subject);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateSubjectDto: UpdateSubjectDto,
  ) {
    const subject = await this.subjectService.update(id, updateSubjectDto);
    return BaseResponseDto.success('Subject updated successfully', subject);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.subjectService.remove(id);
    return BaseResponseDto.success('Subject deleted successfully');
  }
}
