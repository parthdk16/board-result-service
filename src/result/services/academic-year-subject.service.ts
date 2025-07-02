// src/academic-year-subjects/services/academic-year-subject.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AcademicYearSubjectRepository } from '../repositories/academic-year-subject.repository';
import {
  CreateAcademicYearSubjectDto,
  UpdateAcademicYearSubjectDto,
} from '../dto/academic-year-subject.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AcademicYearSubject } from '../../database/entities/academic-year-subject.entity';

@Injectable()
export class AcademicYearSubjectService {
  constructor(
    private readonly academicYearSubjectRepository: AcademicYearSubjectRepository,
  ) {}

  async create(
    createAcademicYearSubjectDto: CreateAcademicYearSubjectDto,
  ): Promise<AcademicYearSubject> {
    try {
      // Check unique constraint before creating
      const isUnique =
        await this.academicYearSubjectRepository.checkUniqueConstraint(
          createAcademicYearSubjectDto.academicYearId,
          createAcademicYearSubjectDto.subjectId,
          createAcademicYearSubjectDto.classLevelId,
          createAcademicYearSubjectDto.streamId,
        );

      if (!isUnique) {
        throw new ConflictException(
          'Subject already exists for this academic year, class level, and stream combination',
        );
      }

      const payload = {
        academicYear: { id: createAcademicYearSubjectDto.academicYearId },
        subject: { id: createAcademicYearSubjectDto.subjectId },
        classLevel: createAcademicYearSubjectDto.classLevelId
          ? { id: createAcademicYearSubjectDto.classLevelId }
          : null,
        stream: createAcademicYearSubjectDto.streamId
          ? { id: createAcademicYearSubjectDto.streamId }
          : null,
        class: createAcademicYearSubjectDto.class,
        maxMarks: createAcademicYearSubjectDto.maxMarks ?? 100,
        minPassingMarks: createAcademicYearSubjectDto.minPassingMarks ?? 33,
        isCompulsory: createAcademicYearSubjectDto.isCompulsory ?? true,
        syllabusVersion: createAcademicYearSubjectDto.syllabusVersion,
        isActive: createAcademicYearSubjectDto.isActive ?? true,
      };

      return await this.academicYearSubjectRepository.create(payload);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new ConflictException(
          'Subject already exists for this academic year, class level, and stream combination',
        );
      }
      if (error.code === '23503') {
        throw new BadRequestException(
          'Invalid academic year, subject, class level, or stream ID',
        );
      }
      throw error;
    }
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
    return await this.academicYearSubjectRepository.findAll(
      pagination,
      filters,
    );
  }

  async findOne(id: string): Promise<AcademicYearSubject> {
    const academicYearSubject =
      await this.academicYearSubjectRepository.findById(id);
    if (!academicYearSubject) {
      throw new NotFoundException(
        `Academic year subject with ID ${id} not found`,
      );
    }
    return academicYearSubject;
  }

  async findByAcademicYear(
    academicYearId: string,
  ): Promise<AcademicYearSubject[]> {
    return await this.academicYearSubjectRepository.findByAcademicYear(
      academicYearId,
    );
  }

  async findBySubject(subjectId: string): Promise<AcademicYearSubject[]> {
    return await this.academicYearSubjectRepository.findBySubject(subjectId);
  }

  async findByClassLevel(classLevelId: string): Promise<AcademicYearSubject[]> {
    return await this.academicYearSubjectRepository.findByClassLevel(
      classLevelId,
    );
  }

  async findByStream(streamId: string): Promise<AcademicYearSubject[]> {
    return await this.academicYearSubjectRepository.findByStream(streamId);
  }

  async findByAcademicYearAndClass(
    academicYearId: string,
    classLevelId?: string,
    streamId?: string,
  ): Promise<AcademicYearSubject[]> {
    return await this.academicYearSubjectRepository.findByAcademicYearAndClass(
      academicYearId,
      classLevelId,
      streamId,
    );
  }

  async findCompulsorySubjects(
    academicYearId: string,
    classLevelId?: string,
    streamId?: string,
  ): Promise<AcademicYearSubject[]> {
    return await this.academicYearSubjectRepository.findCompulsorySubjects(
      academicYearId,
      classLevelId,
      streamId,
    );
  }

  async update(
    id: string,
    updateAcademicYearSubjectDto: UpdateAcademicYearSubjectDto,
  ): Promise<AcademicYearSubject> {
    try {
      // Check if the record exists
      const existing = await this.academicYearSubjectRepository.findById(id);
      if (!existing) {
        throw new NotFoundException(
          `Academic year subject with ID ${id} not found`,
        );
      }

      // Check unique constraint if relevant fields are being updated
      if (
        updateAcademicYearSubjectDto.academicYearId ||
        updateAcademicYearSubjectDto.subjectId ||
        updateAcademicYearSubjectDto.classLevelId !== undefined ||
        updateAcademicYearSubjectDto.streamId !== undefined
      ) {
        const isUnique =
          await this.academicYearSubjectRepository.checkUniqueConstraint(
            updateAcademicYearSubjectDto.academicYearId ??
              existing.academicYear.id,
            updateAcademicYearSubjectDto.subjectId ?? existing.subject.id,
            updateAcademicYearSubjectDto.classLevelId ??
              existing.classLevel?.id,
            updateAcademicYearSubjectDto.streamId ?? existing.stream?.id,
            id, // exclude current record
          );

        if (!isUnique) {
          throw new ConflictException(
            'Subject already exists for this academic year, class level, and stream combination',
          );
        }
      }

      const payload: Partial<AcademicYearSubject> = {
        ...updateAcademicYearSubjectDto,
      };

      // Handle relation updates
      if (updateAcademicYearSubjectDto.academicYearId) {
        payload.academicYear = {
          id: updateAcademicYearSubjectDto.academicYearId,
        } as any;
      }

      if (updateAcademicYearSubjectDto.subjectId) {
        payload.subject = { id: updateAcademicYearSubjectDto.subjectId } as any;
      }

      if (updateAcademicYearSubjectDto.classLevelId !== undefined) {
        payload.classLevel = updateAcademicYearSubjectDto.classLevelId
          ? ({ id: updateAcademicYearSubjectDto.classLevelId } as any)
          : null;
      }

      if (updateAcademicYearSubjectDto.streamId !== undefined) {
        payload.stream = updateAcademicYearSubjectDto.streamId
          ? ({ id: updateAcademicYearSubjectDto.streamId } as any)
          : null;
      }

      const academicYearSubject =
        await this.academicYearSubjectRepository.update(id, payload);
      if (!academicYearSubject) {
        throw new NotFoundException(
          `Academic year subject with ID ${id} not found`,
        );
      }
      return academicYearSubject;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error.code === '23505') {
        throw new ConflictException(
          'Subject already exists for this academic year, class level, and stream combination',
        );
      }
      if (error.code === '23503') {
        throw new BadRequestException(
          'Invalid academic year, subject, class level, or stream ID',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.academicYearSubjectRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(
        `Academic year subject with ID ${id} not found`,
      );
    }
  }

  async findAllActive(): Promise<AcademicYearSubject[]> {
    return await this.academicYearSubjectRepository.findAllActive();
  }

  async bulkCreate(
    createDtos: CreateAcademicYearSubjectDto[],
  ): Promise<AcademicYearSubject[]> {
    try {
      // Validate unique constraints for all entries
      for (const dto of createDtos) {
        const isUnique =
          await this.academicYearSubjectRepository.checkUniqueConstraint(
            dto.academicYearId,
            dto.subjectId,
            dto.classLevelId,
            dto.streamId,
          );

        if (!isUnique) {
          throw new ConflictException(
            `Subject already exists for academic year ${dto.academicYearId}, class level ${dto.classLevelId}, and stream ${dto.streamId} combination`,
          );
        }
      }

      const payload = createDtos.map((dto) => ({
        academicYear: { id: dto.academicYearId },
        subject: { id: dto.subjectId },
        classLevel: dto.classLevelId ? { id: dto.classLevelId } : null,
        stream: dto.streamId ? { id: dto.streamId } : null,
        class: dto.class,
        maxMarks: dto.maxMarks ?? 100,
        minPassingMarks: dto.minPassingMarks ?? 33,
        isCompulsory: dto.isCompulsory ?? true,
        syllabusVersion: dto.syllabusVersion,
        isActive: dto.isActive ?? true,
      }));

      return await this.academicYearSubjectRepository.bulkCreate(payload);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new ConflictException(
          'One or more subjects already exist for the given combinations',
        );
      }
      if (error.code === '23503') {
        throw new BadRequestException(
          'Invalid academic year, subject, class level, or stream ID in one or more entries',
        );
      }
      throw error;
    }
  }

  async bulkUpdateActiveStatus(
    ids: string[],
    isActive: boolean,
  ): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for bulk update');
    }

    await this.academicYearSubjectRepository.bulkUpdateActiveStatus(
      ids,
      isActive,
    );
  }
}
