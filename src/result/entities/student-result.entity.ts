// src/database/entities/student-result.entity.ts
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
  Generated,
} from 'typeorm';
import { Examination } from './examination.entity';
import { Student } from './student.entity';
import { SubjectResult } from './subject-result.entity';
import { NotificationRequest } from './notification-request.entity';

@Entity('student_results')
@Unique('unique_student_exam_result', ['examination', 'student'])
@Index('idx_student_results_exam', ['examination'])
@Index('idx_student_results_student', ['student'])
@Index('idx_student_results_published', ['isPublished'])
@Index('idx_student_results_percentage', ['percentage'])
export class StudentResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', default: 0, name: 'total_marks_obtained' })
  totalMarksObtained: number;

  @Column({ type: 'integer', default: 0, name: 'total_max_marks' })
  totalMaxMarks: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    generatedType: 'STORED',
    asExpression: `CASE WHEN total_max_marks > 0 THEN ROUND((total_marks_obtained::DECIMAL / total_max_marks) * 100, 2) ELSE 0 END`
  })
  percentage: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  grade: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'PENDING',
    name: 'result_status',
  })
  resultStatus: string;

  @Column({ type: 'integer', nullable: true, name: 'overall_rank' })
  overallRank: number;

  @Column({ type: 'boolean', default: false, name: 'is_published' })
  isPublished: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'published_at' })
  publishedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Examination, (examination) => examination.studentResults, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'examination_id' })
  examination: Examination;

  @ManyToOne(() => Student, (student) => student.studentResults, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @OneToMany(
    () => SubjectResult,
    (subjectResult) => subjectResult.studentResult,
  )
  subjectResults: SubjectResult[];

  @OneToMany(
    () => NotificationRequest,
    (notification) => notification.studentResult,
  )
  notificationRequests: NotificationRequest[];
}
