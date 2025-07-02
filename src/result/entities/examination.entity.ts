// src/database/entities/examination.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { AcademicYear } from './academic-year.entity';
import { ClassLevel } from './class-level.entity';
import { Stream } from './stream.entity';
import { StudentResult } from './student-result.entity';

@Entity('examinations')
@Unique('unique_exam', [
  'academicYear',
  'name',
  'classLevel',
  'stream',
  'examType',
])
export class Examination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Deprecated',
  })
  class: string;

  @Column({ type: 'varchar', length: 50, default: 'ANNUAL', name: 'exam_type' })
  examType: string;

  @Column({ type: 'date', nullable: true, name: 'exam_date' })
  examDate: Date;

  @Column({ type: 'date', nullable: true, name: 'result_published_date' })
  resultPublishedDate: Date;

  @Column({ type: 'boolean', default: false, name: 'is_result_published' })
  isResultPublished: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => AcademicYear, (academicYear) => academicYear.examinations, {
    nullable: false,
  })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ManyToOne(() => ClassLevel, (classLevel) => classLevel.examinations, {
    nullable: true,
  })
  @JoinColumn({ name: 'class_level_id' })
  classLevel: ClassLevel;

  @ManyToOne(() => Stream, (stream) => stream.examinations, { nullable: true })
  @JoinColumn({ name: 'stream_id' })
  stream: Stream;

  @OneToMany(() => StudentResult, (studentResult) => studentResult.examination)
  studentResults: StudentResult[];
}
