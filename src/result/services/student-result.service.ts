/ src/elrstu / services / student - result.service.ts;
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StudentResultRepository } from '../repositories/student-result.repository';
import {
  CreateStudentResultDto,
  UpdateStudentResultDto,
} from '../dto/create-student-result.dto';
import { StudentResult } from '../entities/student-result.entity';
import { SubjectResult } from '../entities/subject-result.entity';
import {
  PaginationDto,
  PaginatedResponseDto,
} from '../../common/dto/pagination.dto';

@Injectable()
export class StudentResultService {
  constructor(
    private readonly studentResultRepository: StudentResultRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createResultDto: CreateStudentResultDto,
  ): Promise<StudentResult> {
    // Check if result already exists for this student and exam
    const existingResult =
      await this.studentResultRepository.findByStudentAndExam(
        createResultDto.studentId,
        createResultDto.examinationId,
      );
    if (existingResult) {
      throw new ConflictException(
        'Result already exists for this student and examination',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // Create student result
      const studentResult = manager.create(StudentResult, {
        ...createResultDto,
        examination: { id: createResultDto.examinationId } as any,
        student: { id: createResultDto.studentId } as any,
      });

      const savedResult = await manager.save(studentResult);

      // Create subject results if provided
      if (
        createResultDto.subjectResults &&
        createResultDto.subjectResults.length > 0
      ) {
        let totalObtained = 0;
        let totalMax = 0;

        const subjectResults = createResultDto.subjectResults.map(
          (subjectDto) => {
            totalObtained += subjectDto.marksObtained;
            totalMax += subjectDto.maxMarks;

            return manager.create(SubjectResult, {
              ...subjectDto,
              studentResult: savedResult,
              academicYearSubject: {
                id: subjectDto.academicYearSubjectId,
              } as any,
            });
          },
        );

        await manager.save(subjectResults);

        // Update total marks
        savedResult.totalMarksObtained = totalObtained;
        savedResult.totalMaxMarks = totalMax;
        await manager.save(savedResult);
      }

      return savedResult;
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: any,
  ): Promise<PaginatedResponseDto<StudentResult>> {
    const [results, total] = await this.studentResultRepository.findAll(
      pagination,
      filters,
    );
    return new PaginatedResponseDto(
      results,
      total,
      pagination.page,
      pagination.limit,
    );
  }

  async findOne(id: string): Promise<StudentResult> {
    const result = await this.studentResultRepository.findById(id);
    if (!result) {
      throw new NotFoundException('Student result not found');
    }
    return result;
  }

  async findByStudentAndExam(
    studentId: string,
    examinationId: string,
  ): Promise<StudentResult> {
    const result = await this.studentResultRepository.findByStudentAndExam(
      studentId,
      examinationId,
    );
    if (!result) {
      throw new NotFoundException(
        'Student result not found for this examination',
      );
    }
    return result;
  }

  async update(
    id: string,
    updateResultDto: UpdateStudentResultDto,
  ): Promise<StudentResult> {
    const result = await this.studentResultRepository.findById(id);
    if (!result) {
      throw new NotFoundException('Student result not found');
    }

    return await this.studentResultRepository.update(id, updateResultDto);
  }

  async remove(id: string): Promise<void> {
    const result = await this.studentResultRepository.findById(id);
    if (!result) {
      throw new NotFoundException('Student result not found');
    }

    const deleted = await this.studentResultRepository.delete(id);
    if (!deleted) {
      throw new ConflictException('Unable to delete student result');
    }
  }

  async publishResults(examinationId: string): Promise<StudentResult[]> {
    // Calculate ranks first
    await this.studentResultRepository.calculateRanks(examinationId);

    // Then publish results
    return await this.studentResultRepository.publishResults(examinationId);
  }

  async getResultsByExamination(
    examinationId: string,
  ): Promise<StudentResult[]> {
    return await this.studentResultRepository.findByExamination(examinationId);
  }
}
