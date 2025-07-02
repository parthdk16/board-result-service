// src/streams/repositories/stream.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Stream } from '../entities/stream.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class StreamRepository {
  constructor(
    @InjectRepository(Stream)
    private readonly repository: Repository<Stream>,
    private readonly dataSource: DataSource,
  ) {}

  async create(streamData: Partial<Stream>): Promise<Stream> {
    const stream = this.repository.create(streamData);
    return await this.repository.save(stream);
  }

  async findById(id: string): Promise<Stream | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['students', 'academicYearSubjects', 'examinations'],
    });
  }

  async findByName(name: string): Promise<Stream | null> {
    return await this.repository.findOne({
      where: { name },
      relations: ['students', 'academicYearSubjects'],
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: Partial<Stream>,
  ): Promise<[Stream[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('stream')
      .leftJoinAndSelect('stream.students', 'students')
      .leftJoinAndSelect('stream.academicYearSubjects', 'academicYearSubjects');

    if (filters?.name) {
      queryBuilder.andWhere('stream.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    queryBuilder
      .skip(pagination.skip)
      .take(pagination.limit)
      .orderBy('stream.name', 'ASC');

    return await queryBuilder.getManyAndCount();
  }

  async update(
    id: string,
    updateData: Partial<Stream>,
  ): Promise<Stream | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAllActive(): Promise<Stream[]> {
    return await this.repository.find({
      order: { name: 'ASC' },
    });
  }
}
