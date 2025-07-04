// src/class-levels/services/class-level.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ClassLevelRepository } from '../repositories/class-level.repository';
import {
  CreateClassLevelDto,
  UpdateClassLevelDto,
} from '../dto/class-level.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ClassLevel } from '../entities/class-level.entity';

@Injectable()
export class ClassLevelService {
  constructor(private readonly classLevelRepository: ClassLevelRepository) {}

  async create(createClassLevelDto: CreateClassLevelDto): Promise<ClassLevel> {
    try {
      return await this.classLevelRepository.create(createClassLevelDto);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Class level with this level already exists',
        );
      }
      throw error;
    }
  }

  async findAll(
    pagination: PaginationDto,
    filters?: Partial<ClassLevel>,
  ): Promise<[ClassLevel[], number]> {
    return await this.classLevelRepository.findAll(pagination, filters);
  }

  async findOne(id: string): Promise<ClassLevel> {
    const classLevel = await this.classLevelRepository.findById(id);
    if (!classLevel) {
      throw new NotFoundException(`Class level with ID ${id} not found`);
    }
    return classLevel;
  }

  async findByLevel(level: string): Promise<ClassLevel> {
    const classLevel = await this.classLevelRepository.findByLevel(level);
    if (!classLevel) {
      throw new NotFoundException(`Class level with level ${level} not found`);
    }
    return classLevel;
  }

  async update(
    id: string,
    updateClassLevelDto: UpdateClassLevelDto,
  ): Promise<ClassLevel> {
    const classLevel = await this.classLevelRepository.update(
      id,
      updateClassLevelDto,
    );
    if (!classLevel) {
      throw new NotFoundException(`Class level with ID ${id} not found`);
    }
    return classLevel;
  }

  async updateWithLevel(
    level: string,
    updateClassLevelDto: UpdateClassLevelDto,
  ): Promise<ClassLevel> {
    const classLevel = await this.classLevelRepository.updateWithLevel(
      level,
      updateClassLevelDto,
    );
    if (!classLevel) {
      throw new NotFoundException(`Class level with level ${level} not found`);
    }
    return classLevel;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.classLevelRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Class level with ID ${id} not found`);
    }
    return;
  }

  // async findAllActive(): Promise<ClassLevel[]> {
  //   return await this.classLevelRepository.findAllActive();
  // }

  async findAllOrderedByLevel(): Promise<ClassLevel[]> {
    return await this.classLevelRepository.findAllOrderedByLevel();
  }
}
