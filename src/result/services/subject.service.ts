// src/subjects/services/subject.service.ts;
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SubjectRepository } from '../repositories/subject.repository';
import { CreateSubjectDto, UpdateSubjectDto } from '../dto/subject.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Subject } from '../entities/subject.entity';

@Injectable()
export class SubjectService {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    try {
      return await this.subjectRepository.create(createSubjectDto);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Subject with this code already exists');
      }
      throw error;
    }
  }

  async findAll(
    pagination: PaginationDto,
    filters?: Partial<Subject>,
  ): Promise<[Subject[], number]> {
    return await this.subjectRepository.findAll(pagination, filters);
  }

  async findOne(id: string): Promise<Subject> {
    const subject = await this.subjectRepository.findById(id);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return subject;
  }

  async findByCode(code: string): Promise<Subject> {
    const subject = await this.subjectRepository.findByCode(code);
    if (!subject) {
      throw new NotFoundException(`Subject with code ${code} not found`);
    }
    return subject;
  }

  async findByName(name: string): Promise<Subject> {
    const subject = await this.subjectRepository.findByName(name);
    if (!subject) {
      throw new NotFoundException(`Subject with name ${name} not found`);
    }
    return subject;
  }

  async update(
    id: string,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    const subject = await this.subjectRepository.update(id, updateSubjectDto);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return subject;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.subjectRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
  }

  async findAllActive(): Promise<Subject[]> {
    return await this.subjectRepository.findAllActive();
  }

  async findBySubjectType(subjectType: string): Promise<Subject[]> {
    return await this.subjectRepository.findBySubjectType(subjectType);
  }
}
