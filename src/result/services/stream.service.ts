// src/streams/services/stream.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { StreamRepository } from '../repositories/stream.repository';
import { CreateStreamDto, UpdateStreamDto } from '../dto/stream.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Stream } from '../entities/stream.entity';

@Injectable()
export class StreamService {
  constructor(private readonly streamRepository: StreamRepository) {}

  async create(createStreamDto: CreateStreamDto): Promise<Stream> {
    try {
      return await this.streamRepository.create(createStreamDto);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Stream with this name already exists');
      }
      throw error;
    }
  }

  async findAll(
    pagination: PaginationDto,
    filters?: Partial<Stream>,
  ): Promise<[Stream[], number]> {
    return await this.streamRepository.findAll(pagination, filters);
  }

  async findOne(id: string): Promise<Stream> {
    const stream = await this.streamRepository.findById(id);
    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }
    return stream;
  }

  async findByName(name: string): Promise<Stream> {
    const stream = await this.streamRepository.findByName(name);
    if (!stream) {
      throw new NotFoundException(`Stream with name ${name} not found`);
    }
    return stream;
  }

  async update(id: string, updateStreamDto: UpdateStreamDto): Promise<Stream> {
    const stream = await this.streamRepository.update(id, updateStreamDto);
    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }
    return stream;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.streamRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }
  }

  async findAllActive(): Promise<Stream[]> {
    return await this.streamRepository.findAllActive();
  }
}
