// src/database/entities/academic-year-subject.entity.ts
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
import { Subject } from './subject.entity';
import { ClassLevel } from './class-level.entity';
import { Stream } from './stream.entity';
import { SubjectResult } from './subject-result.entity';

@Entity('academic_year_subjects')
@Unique('unique_ay_subject_class', [
  'academicYear',
  'subject',
  'classLevel',
  'stream',
])
@Index('idx_ay_subjects_academic_year', ['academicYear'])
@Index('idx_ay_subjects_subject', ['subject'])
@Index('idx_ay_subjects_class', ['class'])
@Index('idx_ay_subjects_active', ['isActive'])
export class AcademicYearSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Deprecated',
  })
  class: string;

  @Column({ type: 'integer', default: 100, name: 'max_marks' })
  maxMarks: number;

  @Column({ type: 'integer', default: 33, name: 'min_passing_marks' })
  minPassingMarks: number;

  @Column({ type: 'boolean', default: true, name: 'is_compulsory' })
  isCompulsory: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'syllabus_version',
  })
  syllabusVersion: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(
    () => AcademicYear,
    (academicYear) => academicYear.academicYearSubjects,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ManyToOne(() => Subject, (subject) => subject.academicYearSubjects, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(
    () => ClassLevel,
    (classLevel) => classLevel.academicYearSubjects,
    { nullable: true },
  )
  @JoinColumn({ name: 'class_level_id' })
  classLevel: ClassLevel;

  @ManyToOne(() => Stream, (stream) => stream.academicYearSubjects, {
    nullable: true,
  })
  @JoinColumn({ name: 'stream_id' })
  stream: Stream;

  @OneToMany(
    () => SubjectResult,
    (subjectResult) => subjectResult.academicYearSubject,
  )
  subjectResults: SubjectResult[];
}
