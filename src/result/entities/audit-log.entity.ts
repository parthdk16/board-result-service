// src/database/entities/audit-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index('idx_audit_logs_table_record', ['tableName', 'recordId'])
@Index('idx_audit_logs_user', ['changedByUserId'])
@Index('idx_audit_logs_created_at', ['createdAt'])
@Index('idx_audit_logs_operation', ['operation'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, name: 'table_name' })
  tableName: string;

  @Column({ type: 'uuid', name: 'record_id' })
  recordId: string;

  @Column({ type: 'varchar', length: 20 })
  operation: string;

  @Column({ type: 'jsonb', nullable: true, name: 'old_values' })
  oldValues: any;

  @Column({ type: 'jsonb', nullable: true, name: 'new_values' })
  newValues: any;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'changed_by_user_id',
  })
  changedByUserId: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'changed_by_user_type',
  })
  changedByUserType: string;

  @Column({ type: 'text', nullable: true, name: 'change_reason' })
  changeReason: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
