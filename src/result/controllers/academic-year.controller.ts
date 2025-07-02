// src/academic-years/controllers/academic-year.controller.ts
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
import { AcademicYearService } from '../services/academic-year.service';
import {
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
} from '../dto/academic-year.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BaseResponseDto } from '../../common/dto/base-response.dto';

@Controller('academic-years')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createAcademicYearDto: CreateAcademicYearDto,
  ) {
    const academicYear = await this.academicYearService.create(
      createAcademicYearDto,
    );
    return BaseResponseDto.success(
      'Academic year created successfully',
      academicYear,
    );
  }

  @Get()
  async findAll(
    @Query(ValidationPipe) pagination: PaginationDto,
    @Query() filters: any,
  ) {
    const [academicYears, count] = await this.academicYearService.findAll(
      pagination,
      filters,
    );
    return BaseResponseDto.success('Academic years retrieved successfully', {
      academicYears,
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
    const academicYears = await this.academicYearService.findAllActive();
    return BaseResponseDto.success(
      'Active academic years retrieved successfully',
      academicYears,
    );
  }

  @Get('current')
  async findCurrent() {
    const academicYear = await this.academicYearService.findCurrent();
    return BaseResponseDto.success(
      'Current academic year retrieved successfully',
      academicYear,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const academicYear = await this.academicYearService.findOne(id);
    return BaseResponseDto.success(
      'Academic year retrieved successfully',
      academicYear,
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateAcademicYearDto: UpdateAcademicYearDto,
  ) {
    const academicYear = await this.academicYearService.update(
      id,
      updateAcademicYearDto,
    );
    return BaseResponseDto.success(
      'Academic year updated successfully',
      academicYear,
    );
  }

  @Patch(':id/set-current')
  async setCurrentAcademicYear(@Param('id', ParseUUIDPipe) id: string) {
    await this.academicYearService.setCurrentAcademicYear(id);
    return BaseResponseDto.success('Academic year set as current successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.academicYearService.remove(id);
  }
}
