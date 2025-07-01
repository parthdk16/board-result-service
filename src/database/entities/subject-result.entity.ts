// src/database/entities/subject-result.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
  Index,
  Generated,
} from 'typeorm';
import { StudentResult } from './student-result.entity';
import { AcademicYearSubject } from './academic-year-subject.entity';

@Entity('subject_results')
@Unique('unique_student_subject_result', [
  'studentResult',
  'academicYearSubject',
])
@Index('idx_subject_results_student_result', ['studentResult'])
@Index('idx_subject_results_ay_subject', ['academicYearSubject'])
export class SubjectResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', name: 'marks_obtained' })
  marksObtained: number;

  @Column({ type: 'integer', default: 100, name: 'max_marks' })
  maxMarks: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  grade: string;

  @Column({
    type: 'boolean',
    generatedType: 'STORED',
    asExpression: `marks_obtained >= (max_marks * 0.33)`,
    name: 'is_pass',
  })
  isPass: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(
    () => StudentResult,
    (studentResult) => studentResult.subjectResults,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'student_result_id' })
  studentResult: StudentResult;

  @ManyToOne(
    () => AcademicYearSubject,
    (aySubject) => aySubject.subjectResults,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'academic_year_subject_id' })
  academicYearSubject: AcademicYearSubject;
}
