// src/database/entities/stream.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from './student.entity';
import { AcademicYearSubject } from './academic-year-subject.entity';
import { Examination } from './examination.entity';

@Entity('streams')
export class Stream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @OneToMany(() => Student, (student) => student.stream)
  students: Student[];

  @OneToMany(() => AcademicYearSubject, (aySubject) => aySubject.stream)
  academicYearSubjects: AcademicYearSubject[];

  @OneToMany(() => Examination, (examination) => examination.stream)
  examinations: Examination[];
}
