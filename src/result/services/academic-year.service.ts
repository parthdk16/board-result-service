// src/academic-years/services/academic-year.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AcademicYearRepository } from '../repositories/academic-year.repository';
import {
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
} from '../dto/academic-year.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AcademicYear } from '../entities/academic-year.entity';

@Injectable()
export class AcademicYearService {
  constructor(
    private readonly academicYearRepository: AcademicYearRepository,
  ) {}

  async create(
    createAcademicYearDto: CreateAcademicYearDto,
  ): Promise<AcademicYear> {
    try {
      const payload = {
        ...createAcademicYearDto,
        startDate: new Date(createAcademicYearDto.startDate),
        endDate: new Date(createAcademicYearDto.endDate),
      };
      return await this.academicYearRepository.create(payload);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Academic year with this year label already exists',
        );
      }
      throw error;
    }
  }

  async findAll(
    pagination: PaginationDto,
    filters?: Partial<AcademicYear>,
  ): Promise<[AcademicYear[], number]> {
    return await this.academicYearRepository.findAll(pagination, filters);
  }

  async findOne(id: string): Promise<AcademicYear> {
    const academicYear = await this.academicYearRepository.findById(id);
    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${id} not found`);
    }
    return academicYear;
  }

  async findCurrent(): Promise<AcademicYear> {
    const academicYear = await this.academicYearRepository.findCurrent();
    if (!academicYear) {
      throw new NotFoundException('No current academic year found');
    }
    return academicYear;
  }

  async update(
    id: string,
    updateAcademicYearDto: UpdateAcademicYearDto,
  ): Promise<AcademicYear> {
    const payload: Partial<AcademicYear> = {
      ...updateAcademicYearDto,
      startDate: updateAcademicYearDto.startDate
        ? typeof updateAcademicYearDto.startDate === 'string'
          ? new Date(updateAcademicYearDto.startDate)
          : updateAcademicYearDto.startDate
        : undefined,
      endDate: updateAcademicYearDto.endDate
        ? typeof updateAcademicYearDto.endDate === 'string'
          ? new Date(updateAcademicYearDto.endDate)
          : updateAcademicYearDto.endDate
        : undefined,
    };

    const academicYear = await this.academicYearRepository.update(id, payload);
    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${id} not found`);
    }
    return academicYear;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.academicYearRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Academic year with ID ${id} not found`);
    }
  }

  async findAllActive(): Promise<AcademicYear[]> {
    return await this.academicYearRepository.findAllActive();
  }

  async setCurrentAcademicYear(id: string): Promise<void> {
    const academicYear = await this.academicYearRepository.findById(id);
    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${id} not found`);
    }
    await this.academicYearRepository.setCurrentAcademicYear(id);
  }
}
