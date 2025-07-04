// src/class-levels/controllers/class-level.controller.ts
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
import { ClassLevelService } from '../services/class-level.service';
import {
  CreateClassLevelDto,
  UpdateClassLevelDto,
} from '../dto/class-level.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BaseResponseDto } from '../../common/dto/base-response.dto';

@Controller('class-levels')
export class ClassLevelController {
  constructor(private readonly classLevelService: ClassLevelService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createClassLevelDto: CreateClassLevelDto) {
    const classLevel = await this.classLevelService.create(createClassLevelDto);
    return BaseResponseDto.success(
      'Class level created successfully',
      classLevel,
    );
  }

  @Get()
  async findAll(
    @Query(ValidationPipe) pagination: PaginationDto,
    @Query() filters: any,
  ) {
    const [classLevels, count] = await this.classLevelService.findAll(
      pagination,
      filters,
    );
    return BaseResponseDto.success('Class levels retrieved successfully', {
      classLevels,
      count,
      pagination: {
        page: Math.floor((pagination.skip ?? 0) / (pagination.limit ?? 10)) + 1,
        limit: pagination.limit,
        total: count,
      },
    });
  }

  // @Get('active')
  // async findAllActive() {
  //   const classLevels = await this.classLevelService.findAllActive();
  //   return BaseResponseDto.success(
  //     'Active class levels retrieved successfully',
  //     classLevels,
  //   );
  // }

  @Get('ordered')
  async findAllOrderedByLevel() {
    const classLevels = await this.classLevelService.findAllOrderedByLevel();
    return BaseResponseDto.success(
      'Class levels retrieved successfully',
      classLevels,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const classLevel = await this.classLevelService.findOne(id);
    return BaseResponseDto.success(
      'Class level retrieved successfully',
      classLevel,
    );
  }

  @Get('level/:level')
  async findByLevel(@Param('level') level: string) {
    const classLevel = await this.classLevelService.findByLevel(level);
    return BaseResponseDto.success(
      'Class level retrieved successfully',
      classLevel,
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateClassLevelDto: UpdateClassLevelDto,
  ) {
    const classLevel = await this.classLevelService.update(
      id,
      updateClassLevelDto,
    );
    return BaseResponseDto.success(
      'Class level updated successfully',
      classLevel,
    );
  }

  @Patch('/level/:level')
  async updateWithLevel(
    @Param('level') level: string,
    @Body(ValidationPipe) updateClassLevelDto: UpdateClassLevelDto,
  ) {
    const classLevel = await this.classLevelService.updateWithLevel(
      level,
      updateClassLevelDto,
    );
    return BaseResponseDto.success(
      'Class level updated successfully',
      classLevel,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.classLevelService.remove(id);
    return BaseResponseDto.success('Class level deleted successfully');
  }
}
