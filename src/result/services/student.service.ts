import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../entities/student.entity';
import { StudentRepository } from '../repositories/student.repository';
import { CreateStudentDto } from '../dto/student.dto';
import { UpdateStudentDto } from '../dto/student.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: StudentRepository,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    try {
      return await this.studentRepository.create(createStudentDto);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation
        throw new ConflictException(
          'Student with this roll number or user ID already exists',
        );
      }
      throw error;
    }
  }

  async findAll(
    pagination: PaginationDto,
    filters?: Partial<Student>,
  ): Promise<[Student[], number]> {
    return await this.studentRepository.findAll(pagination, filters);
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async findByUserId(userId: string): Promise<Student> {
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      throw new NotFoundException(`Student with user ID ${userId} not found`);
    }
    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const student = await this.studentRepository.update(id, updateStudentDto);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.studentRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
  }
}
