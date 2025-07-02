import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../entities/student.entity';
import { StudentService } from '../services/student.service';
import { StudentController } from '../controllers/student.controller';
import { StudentRepository } from '../repositories/student.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  controllers: [StudentController],
  providers: [StudentService, StudentRepository],
  exports: [StudentService, StudentRepository],
})
export class StudentModule {}
