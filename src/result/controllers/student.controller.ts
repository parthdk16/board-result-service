// src/students/controllers/student.controller.ts
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
import { StudentService } from '../services/student.service';
import { CreateStudentDto, UpdateStudentDto } from '../dto/student.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BaseResponseDto } from '../../common/dto/base-response.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createStudentDto: CreateStudentDto) {
    const student = await this.studentService.create(createStudentDto);
    return BaseResponseDto.success('Student created successfully', student);
  }

  @Get()
  async findAll(
    @Query(ValidationPipe) pagination: PaginationDto,
    @Query() filters: any,
  ) {
    const [students, count] = await this.studentService.findAll(
      pagination,
      filters,
    );
    return BaseResponseDto.success('Students retrieved successfully', {
      students,
      count,
      pagination: {
        page: Math.floor((pagination.skip ?? 0) / (pagination.limit ?? 10)) + 1,
        limit: pagination.limit,
        total: count,
      },
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const student = await this.studentService.findOne(id);
    return BaseResponseDto.success('Student retrieved successfully', student);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const student = await this.studentService.findByUserId(userId);
    return BaseResponseDto.success('Student retrieved successfully', student);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateStudentDto: UpdateStudentDto,
  ) {
    const student = await this.studentService.update(id, updateStudentDto);
    return BaseResponseDto.success('Student updated successfully', student);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.studentService.remove(id);
  }
}
