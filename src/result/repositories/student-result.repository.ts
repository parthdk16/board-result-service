// src/result/repositories/student-result.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentResult } from '../entities/student-result.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class StudentResultRepository {
  constructor(
    @InjectRepository(StudentResult)
    private readonly repository: Repository<StudentResult>,
    private readonly dataSource: DataSource,
  ) {}

  async create(resultData: Partial<StudentResult>): Promise<StudentResult> {
    const result = this.repository.create(resultData);
    return await this.repository.save(result);
  }

  async findById(id: string): Promise<StudentResult | null> {
    return await this.repository.findOne({
      where: { id },
      relations: [
        'examination',
        'examination.academicYear',
        'student',
        'subjectResults',
        'subjectResults.academicYearSubject',
        'subjectResults.academicYearSubject.subject',
      ],
    });
  }

  async findByStudentAndExam(studentId: string, examinationId: string): Promise<StudentResult | null> {
    return await this.repository.findOne({
      where: { 
        student: { id: studentId }, 
        examination: { id: examinationId } 
      },
      relations: [
        'examination',
        'student',
        'subjectResults',
        'subjectResults.academicYearSubject',
        'subjectResults.academicYearSubject.subject',
      ],
    });
  }

  async findAll(pagination: PaginationDto, filters?: any): Promise<[StudentResult[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('result')
      .leftJoinAndSelect('result.examination', 'examination')
      .leftJoinAndSelect('result.student', 'student')
      .leftJoinAndSelect('result.subjectResults', 'subjectResults')
      .leftJoinAndSelect('subjectResults.academicYearSubject', 'academicYearSubject')
      .leftJoinAndSelect('academicYearSubject.subject', 'subject');

    if (filters) {
      if (filters.examinationId) {
        queryBuilder.andWhere('examination.id = :examinationId', { 
          examinationId: filters.examinationId 
        });
      }
      if (filters.studentId) {
        queryBuilder.andWhere('student.id = :studentId', { 
          studentId: filters.studentId 
        });
      }
      if (filters.isPublished !== undefined) {
        queryBuilder.andWhere('result.isPublished = :isPublished', { 
          isPublished: filters.isPublished 
        });
      }
      if (filters.resultStatus) {
        queryBuilder.andWhere('result.resultStatus = :resultStatus', { 
          resultStatus: filters.resultStatus 
        });
      }
    }

    queryBuilder
      .skip(pagination.skip)
      .take(pagination.limit)
      .orderBy('result.createdAt', 'DESC');

    return await queryBuilder.getManyAndCount();
  }

  async update(
    id: string,
    updateData: Partial<StudentResult>,
  ): Promise<StudentResult | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByExamination(examinationId: string): Promise<StudentResult[]> {
    return await this.repository.find({
      where: { examination: { id: examinationId } },
      relations: ['student', 'subjectResults'],
      order: { percentage: 'DESC' },
    });
  }

  async publishResults(examinationId: string): Promise<StudentResult[]> {
    const results = await this.repository.find({
      where: { examination: { id: examinationId } },
    });

    const publishedResults = results.map((result) => ({
      ...result,
      isPublished: true,
      publishedAt: new Date(),
    }));

    return await this.repository.save(publishedResults);
  }

  async calculateRanks(examinationId: string): Promise<void> {
    const results = await this.repository.find({
      where: { examination: { id: examinationId } },
      order: { percentage: 'DESC' },
    });

    for (let i = 0; i < results.length; i++) {
      results[i].overallRank = i + 1;
    }

    await this.repository.save(results);
  }
}
