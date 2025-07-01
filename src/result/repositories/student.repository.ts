// src/result/repositories/student.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../entities/student.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly repository: Repository<Student>,
    private readonly dataSource: DataSource,
  ) {}

  async create(studentData: Partial<Student>): Promise<Student> {
    const student = this.repository.create(studentData);
    return await this.repository.save(student);
  }

  async findById(id: string): Promise<Student | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['academicYear', 'classLevel', 'stream'],
    });
  }

  async findByUserId(userId: string): Promise<Student | null> {
    return await this.repository.findOne({
      where: { userId },
      relations: ['academicYear', 'classLevel', 'stream'],
    });
  }

  async findByRollNumber(rollNumber: string, academicYearId: string): Promise<Student | null> {
    return await this.repository.findOne({
      where: { 
        rollNumber, 
        academicYear: { id: academicYearId } 
      },
      relations: ['academicYear', 'classLevel', 'stream'],
    });
  }

  async findAll(pagination: PaginationDto, filters?: Partial<Student>): Promise<[Student[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('student')
      .leftJoinAndSelect('student.academicYear', 'academicYear')
      .leftJoinAndSelect('student.classLevel', 'classLevel')
      .leftJoinAndSelect('student.stream', 'stream');

    if (filters) {
      if (filters.class) {
        queryBuilder.andWhere('student.class = :class', { class: filters.class });
      }
      if (filters.isActive !== undefined) {
        queryBuilder.andWhere('student.isActive = :isActive', { isActive: filters.isActive });
      }
      if (filters.academicYear) {
        queryBuilder.andWhere('academicYear.id = :academicYearId', { 
          academicYearId: filters.academicYear 
        });
      }
    }

    queryBuilder
      .skip(pagination.skip)
      .take(pagination.limit)
      .orderBy('student.createdAt', 'DESC');

    return await queryBuilder.getManyAndCount();
  }

  async update(id: string, updateData: Partial<Student>): Promise<Student | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async findByAcademicYear(academicYearId: string): Promise<Student[]> {
    return await this.repository.find({
      where: { academicYear: { id: academicYearId } },
      relations: ['academicYear', 'classLevel', 'stream'],
    });
  }
}
