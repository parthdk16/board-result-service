// src/academic-years/academic-year.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYear } from '../entities/academic-year.entity';
import { AcademicYearService } from '../services/academic-year.service';
import { AcademicYearController } from '../controllers/academic-year.controller';
import { AcademicYearRepository } from '../repositories/academic-year.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYear])],
  controllers: [AcademicYearController],
  providers: [AcademicYearService, AcademicYearRepository],
  exports: [AcademicYearService, AcademicYearRepository],
})
export class AcademicYearModule {}
