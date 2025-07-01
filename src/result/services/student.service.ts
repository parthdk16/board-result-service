// src/result/services/student.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { StudentRepository } from '../repositories/student.repository';
import { CreateStudentDto, UpdateStudentDto } from '../dto/create-student.dto';
import { Student } from '../entities/student.entity';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepository: StudentRepository) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Check if user already exists
    const existingStudent = await this.studentRepository.findByUserId(createStudentDto.userId);
    if (existingStudent) {
      throw new ConflictException('Student with this user ID already exists');
    }

    // Check if roll number is unique for the academic year
    const existingRollNumber = await this.studentRepository.findByRollNumber(
      createStudentDto.rollNumber,
      createStudentDto.academicYearId
    );
    if (existingRollNumber) {
      throw new ConflictException('Roll number already exists for this academic year');
    }

    return await this.studentRepository.create({
      ...createStudentDto,
      academicYear: { id: createStudentDto.academicYearId } as any,
      classLevel: createStudentDto.classLevelId ? { id: createStudentDto.classLevelId } as any : null,
      stream: createStudentDto.streamId ? { id: createStudentDto.streamId } as any : null,
    });
  }

  async findAll(pagination: PaginationDto, filters?: any): Promise<PaginatedResponseDto<Student>> {
    const [students, total] = await this.studentRepository.findAll(pagination, filters);
    return new PaginatedResponseDto(students, total, pagination.page, pagination.limit);
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  async findByUserId(userId: string): Promise<Student> {
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return await this.studentRepository.update(id, updateStudentDto);
  }

  async remove(id: string): Promise<void> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const deleted = await this.studentRepository.delete(id);
    if (!deleted) {
      throw new ConflictException('Unable to delete student');
    }
  }
}
