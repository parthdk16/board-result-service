// src/academic-year-subjects/controllers/academic-year-subject.controller.ts
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
  ParseBoolPipe,
} from '@nestjs/common';
import { AcademicYearSubjectService } from '../services/academic-year-subject.service';
import {
  CreateAcademicYearSubjectDto,
  UpdateAcademicYearSubjectDto,
} from '../dto/academic-year-subject.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BaseResponseDto } from '../../common/dto/base-response.dto';

@Controller('academic-year-subjects')
export class AcademicYearSubjectController {
  constructor(
    private readonly academicYearSubjectService: AcademicYearSubjectService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe)
    createAcademicYearSubjectDto: CreateAcademicYearSubjectDto,
  ) {
    const academicYearSubject = await this.academicYearSubjectService.create(
      createAcademicYearSubjectDto,
    );
    return BaseResponseDto.success(
      'Academic year subject created successfully',
      academicYearSubject,
    );
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(
    @Body(ValidationPipe)
    createAcademicYearSubjectDtos: CreateAcademicYearSubjectDto[],
  ) {
    const academicYearSubjects =
      await this.academicYearSubjectService.bulkCreate(
        createAcademicYearSubjectDtos,
      );
    return BaseResponseDto.success(
      'Academic year subjects created successfully',
      academicYearSubjects,
    );
  }

  @Get()
  async findAll(
    @Query(ValidationPipe) pagination: PaginationDto,
    @Query() filters: any,
  ) {
    const [academicYearSubjects, count] =
      await this.academicYearSubjectService.findAll(pagination, filters);
    return BaseResponseDto.success(
      'Academic year subjects retrieved successfully',
      {
        academicYearSubjects,
        count,
        pagination: {
          page:
            Math.floor((pagination.skip ?? 0) / (pagination.limit ?? 10)) + 1,
          limit: pagination.limit,
          total: count,
        },
      },
    );
  }

  @Get('active')
  async findAllActive() {
    const academicYearSubjects =
      await this.academicYearSubjectService.findAllActive();
    return BaseResponseDto.success(
      'Active academic year subjects retrieved successfully',
      academicYearSubjects,
    );
  }

  @Get('academic-year/:academicYearId')
  async findByAcademicYear(
    @Param('academicYearId', ParseUUIDPipe) academicYearId: string,
  ) {
    const academicYearSubjects =
      await this.academicYearSubjectService.findByAcademicYear(academicYearId);
    return BaseResponseDto.success(
      'Academic year subjects retrieved successfully',
      academicYearSubjects,
    );
  }

  @Get('subject/:subjectId')
  async findBySubject(@Param('subjectId', ParseUUIDPipe) subjectId: string) {
    const academicYearSubjects =
      await this.academicYearSubjectService.findBySubject(subjectId);
    return BaseResponseDto.success(
      'Academic year subjects retrieved successfully',
      academicYearSubjects,
    );
  }

  @Get('class-level/:classLevelId')
  async findByClassLevel(
    @Param('classLevelId', ParseUUIDPipe) classLevelId: string,
  ) {
    const academicYearSubjects =
      await this.academicYearSubjectService.findByClassLevel(classLevelId);
    return BaseResponseDto.success(
      'Academic year subjects retrieved successfully',
      academicYearSubjects,
    );
  }

  @Get('stream/:streamId')
  async findByStream(@Param('streamId', ParseUUIDPipe) streamId: string) {
    const academicYearSubjects =
      await this.academicYearSubjectService.findByStream(streamId);
    return BaseResponseDto.success(
      'Academic year subjects retrieved successfully',
      academicYearSubjects,
    );
  }

  @Get('academic-year/:academicYearId/class')
  async findByAcademicYearAndClass(
    @Param('academicYearId', ParseUUIDPipe) academicYearId: string,
    @Query('classLevelId') classLevelId?: string,
    @Query('streamId') streamId?: string,
  ) {
    const academicYearSubjects =
      await this.academicYearSubjectService.findByAcademicYearAndClass(
        academicYearId,
        classLevelId,
        streamId,
      );
    return BaseResponseDto.success(
      'Academic year subjects retrieved successfully',
      academicYearSubjects,
    );
  }

  @Get('academic-year/:academicYearId/compulsory')
  async findCompulsorySubjects(
    @Param('academicYearId', ParseUUIDPipe) academicYearId: string,
    @Query('classLevelId') classLevelId?: string,
    @Query('streamId') streamId?: string,
  ) {
    const academicYearSubjects =
      await this.academicYearSubjectService.findCompulsorySubjects(
        academicYearId,
        classLevelId,
        streamId,
      );
    return BaseResponseDto.success(
      'Compulsory subjects retrieved successfully',
      academicYearSubjects,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const academicYearSubject =
      await this.academicYearSubjectService.findOne(id);
    return BaseResponseDto.success(
      'Academic year subject retrieved successfully',
      academicYearSubject,
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe)
    updateAcademicYearSubjectDto: UpdateAcademicYearSubjectDto,
  ) {
    const academicYearSubject = await this.academicYearSubjectService.update(
      id,
      updateAcademicYearSubjectDto,
    );
    return BaseResponseDto.success(
      'Academic year subject updated successfully',
      academicYearSubject,
    );
  }

  @Patch('bulk/active-status')
  async bulkUpdateActiveStatus(
    @Body() body: { ids: string[]; isActive: boolean },
  ) {
    await this.academicYearSubjectService.bulkUpdateActiveStatus(
      body.ids,
      body.isActive,
    );
    return BaseResponseDto.success(
      'Academic year subjects status updated successfully',
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.academicYearSubjectService.remove(id);
    return BaseResponseDto.success(
      'Academic year subject deleted successfully',
    );
  }
}
