// src/database/entities/academic-year.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { AcademicYearSubject } from './academic-year-subject.entity';
import { Examination } from './examination.entity';

@Entity('academic_years')
export class AcademicYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true, name: 'year_label' })
  yearLabel: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'boolean', default: false, name: 'is_current' })
  isCurrent: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Student, (student) => student.academicYear)
  students: Student[];

  @OneToMany(() => AcademicYearSubject, (aySubject) => aySubject.academicYear)
  academicYearSubjects: AcademicYearSubject[];

  @OneToMany(() => Examination, (examination) => examination.academicYear)
  examinations: Examination[];
}
