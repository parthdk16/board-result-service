// entities/subject.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Result } from './result.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  marks: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  totalMarks: number;

  @Column({ type: 'varchar', length: 5 })
  grade: string;

  @Column({ type: 'enum', enum: ['PASS', 'FAIL'], default: 'PASS' })
  status: string;

  // @ManyToOne(() => Result, (result) => result.subjects, { onDelete: 'CASCADE' })
  // result: Result;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
