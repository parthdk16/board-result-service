// src/streams/stream.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stream } from '../entities/stream.entity';
import { StreamService } from '../services/stream.service';
import { StreamController } from '../controllers/stream.controller';
import { StreamRepository } from '../repositories/stream.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Stream])],
  controllers: [StreamController],
  providers: [StreamService, StreamRepository],
  exports: [StreamService, StreamRepository],
})
export class StreamModule {}
