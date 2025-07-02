// src/academic-year-subjects/repositories/academic-year-subject.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYearSubject } from '../../database/entities/academic-year-subject.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AcademicYearSubjectRepository {
  constructor(
    @InjectRepository(AcademicYearSubject)
    private readonly repository: Repository<AcademicYearSubject>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    academicYearSubjectData: Partial<AcademicYearSubject>,
  ): Promise<AcademicYearSubject> {
    const academicYearSubject = this.repository.create(academicYearSubjectData);
    return await this.repository.save(academicYearSubject);
  }

  async findById(id: string): Promise<AcademicYearSubject | null> {
    return await this.repository.findOne({
      where: { id },
      relations: [
        'academicYear',
        'subject',
        'classLevel',
        'stream',
        'subjectResults',
      ],
    });
  }

  async findByAcademicYear(
    academicYearId: string,
  ): Promise<AcademicYearSubject[]> {
    return await this.repository.find({
      where: { academicYear: { id: academicYearId }, isActive: true },
      relations: ['subject', 'classLevel', 'stream'],
      order: { subject: { name: 'ASC' } },
    });
  }

  async findBySubject(subjectId: string): Promise<AcademicYearSubject[]> {
    return await this.repository.find({
      where: { subject: { id: subjectId }, isActive: true },
      relations: ['academicYear', 'classLevel', 'stream'],
      order: { academicYear: { yearLabel: 'DESC' } },
    });
  }

  async findByClassLevel(classLevelId: string): Promise<AcademicYearSubject[]> {
    return await this.repository.find({
      where: { classLevel: { id: classLevelId }, isActive: true },
      relations: ['academicYear', 'subject', 'stream'],
      order: { subject: { name: 'ASC' } },
    });
  }

  async findByStream(streamId: string): Promise<AcademicYearSubject[]> {
    return await this.repository.find({
      where: { stream: { id: streamId }, isActive: true },
      relations: ['academicYear', 'subject', 'classLevel'],
      order: { subject: { name: 'ASC' } },
    });
  }

  async findByAcademicYearAndClass(
    academicYearId: string,
    classLevelId?: string,
    streamId?: string,
  ): Promise<AcademicYearSubject[]> {
    const whereCondition: any = {
      academicYear: { id: academicYearId },
      isActive: true,
    };

    if (classLevelId) {
      whereCondition.classLevel = { id: classLevelId };
    }

    if (streamId) {
      whereCondition.stream = { id: streamId };
    }

    return await this.repository.find({
      where: whereCondition,
      relations: ['subject', 'classLevel', 'stream'],
      order: { subject: { name: 'ASC' } },
    });
  }

  async findCompulsorySubjects(
    academicYearId: string,
    classLevelId?: string,
    streamId?: string,
  ): Promise<AcademicYearSubject[]> {
    const whereCondition: any = {
      academicYear: { id: academicYearId },
      isCompulsory: true,
      isActive: true,
    };

    if (classLevelId) {
      whereCondition.classLevel = { id: classLevelId };
    }

    if (streamId) {
      whereCondition.stream = { id: streamId };
    }

    return await this.repository.find({
      where: whereCondition,
      relations: ['subject', 'classLevel', 'stream'],
      order: { subject: { name: 'ASC' } },
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: Partial<AcademicYearSubject> & {
      academicYearId?: string;
      subjectId?: string;
      classLevelId?: string;
      streamId?: string;
      isCompulsory?: boolean;
    },
  ): Promise<[AcademicYearSubject[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('academicYearSubject')
      .leftJoinAndSelect('academicYearSubject.academicYear', 'academicYear')
      .leftJoinAndSelect('academicYearSubject.subject', 'subject')
      .leftJoinAndSelect('academicYearSubject.classLevel', 'classLevel')
      .leftJoinAndSelect('academicYearSubject.stream', 'stream');

    if (filters?.academicYearId) {
      queryBuilder.andWhere('academicYear.id = :academicYearId', {
        academicYearId: filters.academicYearId,
      });
    }

    if (filters?.subjectId) {
      queryBuilder.andWhere('subject.id = :subjectId', {
        subjectId: filters.subjectId,
      });
    }

    if (filters?.classLevelId) {
      queryBuilder.andWhere('classLevel.id = :classLevelId', {
        classLevelId: filters.classLevelId,
      });
    }

    if (filters?.streamId) {
      queryBuilder.andWhere('stream.id = :streamId', {
        streamId: filters.streamId,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('academicYearSubject.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.isCompulsory !== undefined) {
      queryBuilder.andWhere(
        'academicYearSubject.isCompulsory = :isCompulsory',
        {
        isCompulsory: filters.isCompulsory,
      });
    }

    if (filters?.class) {
      queryBuilder.andWhere('academicYearSubject.class ILIKE :class', {
        class: `%${filters.class}%`,
      });
    }

    if (filters?.syllabusVersion) {
      queryBuilder.andWhere(
        'academicYearSubject.syllabusVersion ILIKE :syllabusVersion',
        {
          syllabusVersion: `%${filters.syllabusVersion}%`,
        },
      );
    }

    queryBuilder
      .offset(pagination.skip)
      .limit(pagination.limit)
      .orderBy('academicYear.yearLabel', 'DESC')
      .addOrderBy('subject.name', 'ASC');

    return await queryBuilder.getManyAndCount();
  }

  async update(
    id: string,
    updateData: Partial<AcademicYearSubject>,
  ): Promise<AcademicYearSubject | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAllActive(): Promise<AcademicYearSubject[]> {
    return await this.repository.find({
      where: { isActive: true },
      relations: ['academicYear', 'subject', 'classLevel', 'stream'],
      order: {
        academicYear: { yearLabel: 'DESC' },
        subject: { name: 'ASC' },
      },
    });
  }

  async checkUniqueConstraint(
    academicYearId: string,
    subjectId: string,
    classLevelId?: string,
    streamId?: string,
    excludeId?: string,
  ): Promise<boolean> {
    const whereCondition: any = {
      academicYear: { id: academicYearId },
      subject: { id: subjectId },
    };

    if (classLevelId) {
      whereCondition.classLevel = { id: classLevelId };
    } else {
      whereCondition.classLevel = null;
    }

    if (streamId) {
      whereCondition.stream = { id: streamId };
    } else {
      whereCondition.stream = null;
    }

    const queryBuilder = this.repository
      .createQueryBuilder('academicYearSubject')
      .where(whereCondition);

    if (excludeId) {
      queryBuilder.andWhere('academicYearSubject.id != :excludeId', {
        excludeId,
      });
    }

    const existing = await queryBuilder.getOne();
    return !existing;
  }

  async bulkCreate(
    academicYearSubjects: Partial<AcademicYearSubject>[],
  ): Promise<AcademicYearSubject[]> {
    return await this.dataSource.transaction(async (manager) => {
      const entities = manager.create(AcademicYearSubject, academicYearSubjects);
      return await manager.save(entities);
    });
  }

  async bulkUpdateActiveStatus(
    ids: string[],
    isActive: boolean,
  ): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(AcademicYearSubject)
      .set({ isActive, updatedAt: new Date() })
      .whereInIds(ids)
      .execute();
  }
}
