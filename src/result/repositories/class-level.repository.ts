// src/class-levels/repositories/class-level.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassLevel } from '../../database/entities/class-level.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ClassLevelRepository {
  constructor(
    @InjectRepository(ClassLevel)
    private readonly repository: Repository<ClassLevel>,
    private readonly dataSource: DataSource,
  ) {}

  async create(classLevelData: Partial<ClassLevel>): Promise<ClassLevel> {
    const classLevel = this.repository.create(classLevelData);
    return await this.repository.save(classLevel);
  }

  async findById(id: string): Promise<ClassLevel | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['students', 'academicYearSubjects', 'examinations'],
    });
  }

  async findByLevel(level: string): Promise<ClassLevel | null> {
    return await this.repository.findOne({
      where: { level },
      relations: ['students', 'academicYearSubjects'],
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: Partial<ClassLevel>,
  ): Promise<[ClassLevel[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('classLevel')
      .leftJoinAndSelect('classLevel.students', 'students')
      .leftJoinAndSelect(
        'classLevel.academicYearSubjects',
        'academicYearSubjects',
      );

    if (filters?.level) {
      queryBuilder.andWhere('classLevel.level ILIKE :level', {
        level: `%${filters.level}%`,
      });
    }

    // if (filters?.name) {
    //   queryBuilder.andWhere('classLevel.name ILIKE :name', {
    //     name: `%${filters.name}%`,
    //   });
    // }

    // if (filters?.isActive !== undefined) {
    //   queryBuilder.andWhere('classLevel.isActive = :isActive', {
    //     isActive: filters.isActive,
    //   });
    // }

    queryBuilder
      .offset(pagination.skip)
      .limit(pagination.limit)
      // .orderBy('classLevel.sortOrder', 'ASC')
      .addOrderBy('classLevel.level', 'ASC');

    return await queryBuilder.getManyAndCount();
  }

  async update(
    id: string,
    updateData: Partial<ClassLevel>,
  ): Promise<ClassLevel | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async updateWithLevel(
    level: string,
    updateData: Partial<ClassLevel>,
  ): Promise<ClassLevel | null> {
    await this.repository
      .createQueryBuilder()
      .update(ClassLevel)
      .set({updateData})
      .where('level = :level', { level })
      .execute();

    return this.findByLevel(level);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAllActive(): Promise<ClassLevel[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', level: 'ASC' },
    });
  }

  async findAllOrderedByLevel(): Promise<ClassLevel[]> {
    return await this.repository.find({
      order: { sortOrder: 'ASC', level: 'ASC' },
    });
  }
}
