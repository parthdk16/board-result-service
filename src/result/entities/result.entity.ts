import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ResultStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  ABSENT = 'ABSENT',
  PENDING = 'PENDING',
}

export enum BoardType {
  CBSE = 'CBSE',
  ICSE = 'ICSE',
  STATE_BOARD = 'STATE_BOARD',
  IGCSE = 'IGCSE',
  IB = 'IB',
}

export enum ClassGrade {
  TEN = '10',
  TWELVE = '12',
  DIPLOMA = 'DIPLOMA',
  UNDERGRADUATE = 'UNDERGRADUATE',
  POSTGRADUATE = 'POSTGRADUATE',
}

export interface SubjectMark {
  total: number;
  obtained: number;
  grade?: string;
  remarks?: string;
}

export interface SubjectMarks {
  [subjectName: string]: SubjectMark;
}

@Entity('results')
@Index(['studentId', 'boardType', 'classGrade', 'academicYear', 'rollNumber'], {
  unique: true,
})
export class Result {
  @ApiProperty({ description: 'Unique identifier for the result' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Student ID from user service' })
  @Column({ name: 'student_id' })
  @Index()
  studentId: string;

  @ApiProperty({ enum: BoardType, description: 'Type of educational board' })
  @Column({
    type: 'enum',
    enum: BoardType,
    name: 'board_type',
  })
  @Index()
  boardType: BoardType;

  @ApiProperty({ enum: ClassGrade, description: 'Class or grade level' })
  @Column({
    type: 'enum',
    enum: ClassGrade,
    name: 'class_grade',
  })
  @Index()
  classGrade: ClassGrade;

  @ApiProperty({ description: 'Academic year (e.g., 2023-2024)' })
  @Column({ name: 'academic_year', length: 9 })
  @Index()
  academicYear: string;

  @ApiProperty({ description: 'Student roll number' })
  @Column({ name: 'roll_number', length: 50 })
  @Index()
  rollNumber: string;

  @ApiProperty({ description: 'Registration number', required: false })
  @Column({ name: 'registration_number', length: 50, nullable: true })
  registrationNumber?: string;

  @ApiProperty({ description: 'School code', required: false })
  @Column({ name: 'school_code', length: 20, nullable: true })
  schoolCode?: string;

  @ApiProperty({ description: 'School name', required: false })
  @Column({ name: 'school_name', length: 255, nullable: true })
  schoolName?: string;

  @ApiProperty({ enum: ResultStatus, description: 'Result status' })
  @Column({
    type: 'enum',
    enum: ResultStatus,
    name: 'result_status',
    default: ResultStatus.PENDING,
  })
  @Index()
  resultStatus: ResultStatus;

  @ApiProperty({ description: 'Total marks', required: false })
  @Column({ name: 'total_marks', nullable: true })
  totalMarks?: number;

  @ApiProperty({ description: 'Obtained marks', required: false })
  @Column({ name: 'obtained_marks', nullable: true })
  obtainedMarks?: number;

  @ApiProperty({ description: 'Percentage', required: false })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage?: number;

  @ApiProperty({ description: 'Grade (A+, A, B+, etc.)', required: false })
  @Column({ length: 5, nullable: true })
  grade?: string;

  @ApiProperty({
    description: 'Division (First, Second, Third)',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  division?: string;

  @ApiProperty({ description: 'Subject-wise marks in JSON format' })
  @Column({ type: 'jsonb', name: 'subject_marks', nullable: true })
  subjectMarks?: SubjectMarks;

  @ApiProperty({ description: 'Result publication timestamp', required: false })
  @Column({ name: 'published_at', nullable: true })
  publishedAt?: Date;

  @ApiProperty({
    description: 'ID of admin who published the result',
    required: false,
  })
  @Column({ name: 'published_by', nullable: true })
  publishedBy?: string;

  @ApiProperty({ description: 'Whether the result is published' })
  @Column({ name: 'is_published', default: false })
  @Index()
  isPublished: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
