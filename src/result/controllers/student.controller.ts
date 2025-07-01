// src/result/controllers/student.controller.ts
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
import { StudentService } from '../services/student.service';
import { CreateStudentDto, UpdateStudentDto } from '../dto/create-student.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BaseResponseDto } from '../../common/dto/base-response.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStudentDto: CreateStudentDto) {
    try {
      const student = await this.studentService.create(createStudentDto);
      return BaseResponseDto.success('Student created successfully', student);
    } catch (error) {
      return BaseResponseDto.error('Failed to create student', error.message);
    }
  }

  @Get()
  async findAll(@Query() pagination: PaginationDto, @Query() filters: any) {
    try {
      const students = await this.studentService.findAll(pagination, filters);
      return BaseResponseDto.success(
        'Students retrieved successfully',
        students,
      );
    } catch (error) {
      return BaseResponseDto.error(
        'Failed to retrieve students',
        error.message,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const student = await this.studentService.findOne(id);
      return BaseResponseDto.success('Student retrieved successfully', student);
    } catch (error) {
      return BaseResponseDto.error('Failed to retrieve student', error.message);
    }
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    try {
      const student = await this.studentService.findByUserId(userId);
      return BaseResponseDto.success('Student retrieved successfully', student);
    } catch (error) {
      return BaseResponseDto.error('Failed to retrieve student', error.message);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    try {
      const student = await this.studentService.update(id, updateStudentDto);
      return BaseResponseDto.success('Student updated successfully', student);
    } catch (error) {
      return BaseResponseDto.error('Failed to update student', error.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.studentService.remove(id);
      return BaseResponseDto.success('Student deleted successfully');
    } catch (error) {
      return BaseResponseDto.error('Failed to delete student', error.message);
    }
  }
}
