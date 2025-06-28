import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum BoardType {
  CBSE = 'CBSE', // Only one board type retained
}

export enum ClassGrade {
  GRADE_10 = '10',
  GRADE_12 = '12',
}

export enum ResultStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  ABSENT = 'ABSENT',
  PENDING = 'PENDING',
}

@Entity('results')
@Index(['studentId', 'boardType', 'classGrade', 'academicYear'], {
  unique: true,
})
@Index(['rollNumber', 'boardType', 'academicYear'])
@Index(['isPublished'])
@Index(['resultStatus'])
export class Result {
  @ApiProperty({ description: 'Unique identifier for the result' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Student ID reference' })
  @Column({ name: 'student_id' })
  @Index()
  studentId: string;

  @ApiProperty({ description: 'Student name' })
  @Column({ name: 'student_name' })
  studentName: string;

  @ApiProperty({ description: 'Student roll number' })
  @Column({ name: 'roll_number' })
  rollNumber: string;

  @ApiProperty({ enum: BoardType, description: 'Board type' })
  @Column({
    type: 'enum',
    enum: BoardType,
    name: 'board_type',
  })
  boardType: BoardType;

  @ApiProperty({ enum: ClassGrade, description: 'Class/Grade' })
  @Column({
    type: 'enum',
    enum: ClassGrade,
    name: 'class_grade',
  })
  classGrade: ClassGrade;

  @ApiProperty({ description: 'Academic year (e.g., 2023-24)' })
  @Column({ name: 'academic_year' })
  academicYear: string;

  @ApiProperty({ description: 'Subject-wise marks', type: 'object' })
  @Column({ type: 'jsonb', name: 'subject_marks', nullable: true })
  subjectMarks: Record<string, number>;

  @ApiProperty({ description: 'Total marks' })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_marks' })
  totalMarks: number;

  @ApiProperty({ description: 'Obtained marks' })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'obtained_marks' })
  obtainedMarks: number;

  @ApiProperty({ description: 'Percentage scored' })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'percentage',
    nullable: true,
  })
  percentage: number;

  @ApiProperty({ description: 'Overall grade' })
  @Column({ name: 'overall_grade', nullable: true })
  overallGrade: string;

  @ApiProperty({ enum: ResultStatus, description: 'Result status' })
  @Column({
    type: 'enum',
    enum: ResultStatus,
    name: 'result_status',
    default: ResultStatus.PENDING,
  })
  resultStatus: ResultStatus;

  @ApiProperty({ description: 'Additional remarks' })
  @Column({ nullable: true })
  remarks: string;

  @ApiProperty({ description: 'Whether result is published' })
  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @ApiProperty({ description: 'When result was published' })
  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  @ApiProperty({ description: 'Who published the result' })
  @Column({ name: 'published_by', nullable: true })
  publishedBy: string;

  @ApiProperty({ description: 'Who created the result' })
  @Column({ name: 'created_by' })
  createdBy: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
