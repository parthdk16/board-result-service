// src/streams/controllers/stream.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import { StreamService } from '../services/stream.service';
import { CreateStreamDto, UpdateStreamDto } from '../dto/stream.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BaseResponseDto } from '../../common/dto/base-response.dto';

@Controller('streams')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createStreamDto: CreateStreamDto) {
    const stream = await this.streamService.create(createStreamDto);
    return BaseResponseDto.success('Stream created successfully', stream);
  }

  @Get()
  async findAll(
    @Query(ValidationPipe) pagination: PaginationDto,
    @Query() filters: any,
  ) {
    const [streams, count] = await this.streamService.findAll(
      pagination,
      filters,
    );
    return BaseResponseDto.success('Streams retrieved successfully', {
      streams,
      count,
      pagination: {
        page: Math.floor((pagination.skip ?? 0) / (pagination.limit ?? 10)) + 1,
        limit: pagination.limit,
        total: count,
      }
    });
  }

  @Get('active')
  async findAllActive() {
    const streams = await this.streamService.findAllActive();
    return BaseResponseDto.success(
      'Active streams retrieved successfully',
      streams,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const stream = await this.streamService.findOne(id);
    return BaseResponseDto.success('Stream retrieved successfully', stream);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateStreamDto: UpdateStreamDto,
  ) {
    const stream = await this.streamService.update(id, updateStreamDto);
    return BaseResponseDto.success('Stream updated successfully', stream);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.streamService.remove(id);
    return BaseResponseDto.success('Stream deleted successfully');
  }
}
