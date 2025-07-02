// src/subjects/subject.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from '../entities/subject.entity';
import { SubjectService } from '../services/subject.service';
import { SubjectController } from '../controllers/subject.controller';
import { SubjectRepository } from '../repositories/subject.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Subject])],
  controllers: [SubjectController],
  providers: [SubjectService, SubjectRepository],
  exports: [SubjectService, SubjectRepository],
})
export class SubjectModule {}
