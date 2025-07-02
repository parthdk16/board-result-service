// src/result/repositories/examination.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Examination } from '../entities/examination.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ExaminationRepository {
  constructor(
    @InjectRepository(Examination)
    private readonly repository: Repository<Examination>,
    private readonly dataSource: DataSource,
  ) {}

  async create(examData: Partial<Examination>): Promise<Examination> {
    const examination = this.repository.create(examData);
    return await this.repository.save(examination);
  }

  async findById(id: string): Promise<Examination | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['academicYear', 'classLevel', 'stream'],
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: any,
  ): Promise<[Examination[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.academicYear', 'academicYear')
      .leftJoinAndSelect('exam.classLevel', 'classLevel')
      .leftJoinAndSelect('exam.stream', 'stream');

    if (filters) {
      if (filters.academicYearId) {
        queryBuilder.andWhere('academicYear.id = :academicYearId', {
          academicYearId: filters.academicYearId,
        });
      }
      if (filters.examType) {
        queryBuilder.andWhere('exam.examType = :examType', {
          examType: filters.examType,
        });
      }
      if (filters.isResultPublished !== undefined) {
        queryBuilder.andWhere('exam.isResultPublished = :isResultPublished', {
          isResultPublished: filters.isResultPublished,
        });
      }
    }

    queryBuilder
      .skip(pagination.skip)
      .take(pagination.limit)
      .orderBy('exam.createdAt', 'DESC');

    return await queryBuilder.getManyAndCount();
  }

  async update(
    id: string,
    updateData: Partial<Examination>,
  ): Promise<Examination | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    // return result.affected > 0;
    return (result.affected ?? 0) > 0;
  }
}
