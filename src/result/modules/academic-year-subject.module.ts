// src/academic-year-subjects/academic-year-subject.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearSubject } from '../entities/academic-year-subject.entity';
import { AcademicYearSubjectService } from '../services/academic-year-subject.service';
import { AcademicYearSubjectController } from '../controllers/academic-year-subject.controller';
import { AcademicYearSubjectRepository } from '../repositories/academic-year-subject.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYearSubject])],
  controllers: [AcademicYearSubjectController],
  providers: [AcademicYearSubjectService, AcademicYearSubjectRepository],
  exports: [AcademicYearSubjectService, AcademicYearSubjectRepository],
})
export class AcademicYearSubjectModule {}
