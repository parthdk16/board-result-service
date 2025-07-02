// src/database/entities/class-level.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from './student.entity';
import { AcademicYearSubject } from './academic-year-subject.entity';
import { Examination } from './examination.entity';

@Entity('class_levels')
export class ClassLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  level: string;

  @OneToMany(() => Student, (student) => student.classLevel)
  students: Student[];

  @OneToMany(() => AcademicYearSubject, (aySubject) => aySubject.classLevel)
  academicYearSubjects: AcademicYearSubject[];

  @OneToMany(() => Examination, (examination) => examination.classLevel)
  examinations: Examination[];
}
