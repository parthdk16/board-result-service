// src/academic-years/repositories/academic-year.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYear } from '../entities/academic-year.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AcademicYearRepository {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly repository: Repository<AcademicYear>,
    private readonly dataSource: DataSource,
  ) {}

  async create(academicYearData: Partial<AcademicYear>): Promise<AcademicYear> {
    const academicYear = this.repository.create(academicYearData);
    return await this.repository.save(academicYear);
  }

  async findById(id: string): Promise<AcademicYear | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['students', 'academicYearSubjects', 'examinations'],
    });
  }

  async findByYearLabel(yearLabel: string): Promise<AcademicYear | null> {
    return await this.repository.findOne({
      where: { yearLabel },
      relations: ['students', 'academicYearSubjects'],
    });
  }

  async findCurrent(): Promise<AcademicYear | null> {
    return await this.repository.findOne({
      where: { isCurrent: true, isActive: true },
      relations: ['students', 'academicYearSubjects'],
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: Partial<AcademicYear>,
  ): Promise<[AcademicYear[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('academicYear')
      .leftJoinAndSelect('academicYear.students', 'students')
      .leftJoinAndSelect(
        'academicYear.academicYearSubjects',
        'academicYearSubjects',
      );

    if (filters?.yearLabel) {
      queryBuilder.andWhere('academicYear.yearLabel ILIKE :yearLabel', {
        yearLabel: `%${filters.yearLabel}%`,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('academicYear.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.isCurrent !== undefined) {
      queryBuilder.andWhere('academicYear.isCurrent = :isCurrent', {
        isCurrent: filters.isCurrent,
      });
    }

    queryBuilder
      .skip(pagination.skip)
      .take(pagination.limit)
      .orderBy('academicYear.startDate', 'DESC');

    return await queryBuilder.getManyAndCount();
  }

  async update(
    id: string,
    updateData: Partial<AcademicYear>,
  ): Promise<AcademicYear | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAllActive(): Promise<AcademicYear[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { startDate: 'DESC' },
    });
  }

  async setCurrentAcademicYear(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // First, set all academic years to not current
      await manager.update(AcademicYear, {}, { isCurrent: false });
      // Then set the specified one as current
      await manager.update(AcademicYear, { id }, { isCurrent: true });
    });
  }
}
