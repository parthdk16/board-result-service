// src/result/controllers/student-result.controller.ts
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
} from '@nestjs/common';
import { StudentResultService } from '../services/student-result.service';
import {
  CreateStudentResultDto,
  UpdateStudentResultDto,
} from '../dto/create-student-result.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

@Controller('student-results')
export class StudentResultController {
  constructor(private readonly studentResultService: StudentResultService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createResultDto: CreateStudentResultDto) {
    try {
      const result = await this.studentResultService.create(createResultDto);
      return BaseResponseDto.success(
        'Student result created successfully',
        result,
      );
    } catch (error) {
      return BaseResponseDto.error(
        'Failed to create student result',
        error.message,
      );
    }
  }

  @Get()
  async findAll(@Query() pagination: PaginationDto, @Query() filters: any) {
    try {
      const results = await this.studentResultService.findAll(
        pagination,
        filters,
      );
      return BaseResponseDto.success(
        'Student results retrieved successfully',
        results,
      );
    } catch (error) {
      return BaseResponseDto.error(
        'Failed to retrieve student results',
        error.message,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.studentResultService.findOne(id);
      return BaseResponseDto.success(
        'Student result retrieved successfully',
        result,
      );
    } catch (error) {
      return BaseResponseDto.error(
        'Failed to retrieve student result',
        error.message,
      );
    }
  }

  @Get('student/:studentId/examination/:examinationId')
  async findByStudentAndExam(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('examinationId', ParseUUIDPipe) examinationId: string,
  ) {
    try {
      const result = await this.studentResultService.findByStudentAndExam(
        studentId,
        examinationId,
      );
      return BaseResponseDto.success(
        'Student result retrieved successfully',
        result,
      );
    } catch (error) {
      return BaseResponseDto.error(
        'Failed to retrieve student result',
        error.message,
      );
    }
  }

  @Get('examination/:examinationId')
  async getResultsByExamination(
    @Param('examinationId', ParseUUIDPipe) examinationId: string,
  ) {
    try {
      const results =
        await this.studentResultService.getResultsByExamination(examinationId);
      return BaseResponseDto.success(
        'Examination results retrieved successfully',
        results,
      );
    } catch (error) {
      return BaseResponseDto.error(
        'Failed to retrieve examination results',
        error.message,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateResultDto: UpdateStudentResultDto,
  ) {
    try {
      const result = await this.studentResultService.update(
        id,
        updateResultDto,
      );
      return BaseResponseDto.success(
        'Student result updated successfully',
        result,
      );
    } catch (error) {
      return BaseResponseDto.error(
        'Failed to update student result',
        error.message,
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.studentResultService.remove(id);
      return BaseResponseDto.success('Student result deleted successfully');
    } catch (error) {
      return BaseResponseDto.error(
        'Failed to delete student result',
        error.message,
      );
    }
  }

  @Patch('examination/:examinationId/publish')
  async publishResults(
    @Param('examinationId', ParseUUIDPipe) examinationId: string,
  ) {
    try {
      const results =
        await this.studentResultService.publishResults(examinationId);
      return BaseResponseDto.success('Results published successfully', results);
    } catch (error) {
      return BaseResponseDto.error('Failed to publish results', error.message);
    }
  }
}
