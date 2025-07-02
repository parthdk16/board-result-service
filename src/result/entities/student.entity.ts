// src/database/entities/student.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';
import { AcademicYear } from './academic-year.entity';
import { ClassLevel } from './class-level.entity';
import { Stream } from './stream.entity';
import { StudentResult } from './student-result.entity';

@Entity('students')
@Unique('unique_roll_per_ay_class', ['academicYear', 'class', 'rollNumber'])
@Index('idx_students_user_id', ['userId'])
@Index('idx_students_roll_number', ['rollNumber'])
@Index('idx_students_email', ['email'])
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 50, name: 'roll_number' })
  rollNumber: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'Deprecated' })
  class: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => AcademicYear, (academicYear) => academicYear.students, { nullable: false })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ManyToOne(() => ClassLevel, (classLevel) => classLevel.students, { nullable: true })
  @JoinColumn({ name: 'class_level_id' })
  classLevel: ClassLevel;

  @ManyToOne(() => Stream, (stream) => stream.students, { nullable: true })
  @JoinColumn({ name: 'stream_id' })
  stream: Stream;

  @OneToMany(() => StudentResult, (studentResult) => studentResult.student)
  studentResults: StudentResult[];
}
