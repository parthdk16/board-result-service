// src/class-levels/class-level.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassLevel } from '../entities/class-level.entity';
import { ClassLevelService } from '../services/class-level.service';
import { ClassLevelController } from '../controllers/class-level.controller';
import { ClassLevelRepository } from '../repositories/class-level.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClassLevel])],
  controllers: [ClassLevelController],
  providers: [ClassLevelService, ClassLevelRepository],
  exports: [ClassLevelService, ClassLevelRepository],
})
export class ClassLevelModule {}
