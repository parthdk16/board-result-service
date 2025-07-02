// src/subjects/repositories/subject.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from '../entities/subject.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SubjectRepository {
  constructor(
    @InjectRepository(Subject)
    private readonly repository: Repository<Subject>,
    private readonly dataSource: DataSource,
  ) {}

  async create(subjectData: Partial<Subject>): Promise<Subject> {
    const subject = this.repository.create(subjectData);
    return await this.repository.save(subject);
  }

  async findById(id: string): Promise<Subject | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['academicYearSubjects'],
    });
  }

  async findByCode(code: string): Promise<Subject | null> {
    return await this.repository.findOne({
      where: { code },
      relations: ['academicYearSubjects'],
    });
  }

  async findByName(name: string): Promise<Subject | null> {
    return await this.repository
      .createQueryBuilder('subject')
      // .leftJoinAndSelect('subject.academicYearSubjects', 'academicYearSubjects')
      .where('subject.name ILIKE :name', { name })
      .getOne();
  }

  async findAll(
    pagination: PaginationDto,
    filters?: Partial<Subject>,
  ): Promise<[Subject[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('subject')
      .leftJoinAndSelect(
        'subject.academicYearSubjects',
        'academicYearSubjects',
      );

    if (filters?.name) {
      queryBuilder.andWhere('subject.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters?.code) {
      queryBuilder.andWhere('subject.code ILIKE :code', {
        code: `%${filters.code}%`,
      });
    }

    if (filters?.subjectType) {
      queryBuilder.andWhere('subject.subjectType = :subjectType', {
        subjectType: filters.subjectType,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('subject.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    queryBuilder
      .skip(pagination.skip)
      .take(pagination.limit)
      .orderBy('subject.name', 'ASC');

    console.log('Executing query:', queryBuilder.getSql());

    return await queryBuilder.getManyAndCount();
  }

  async update(
    id: string,
    updateData: Partial<Subject>,
  ): Promise<Subject | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAllActive(): Promise<Subject[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findBySubjectType(subjectType: string): Promise<Subject[]> {
    return await this.repository.find({
      where: { subjectType, isActive: true },
      order: { name: 'ASC' },
    });
  }
}
