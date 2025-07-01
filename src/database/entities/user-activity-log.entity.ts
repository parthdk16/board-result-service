// src/database/entities/user-activity-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_activity_logs')
@Index('idx_user_activity_user_id', ['userId'])
@Index('idx_user_activity_user_type', ['userType'])
@Index('idx_user_activity_activity_type', ['activityType'])
@Index('idx_user_activity_resource', ['resourceType', 'resourceId'])
@Index('idx_user_activity_created_at', ['createdAt'])
@Index('idx_user_activity_success', ['success'])
@Index('idx_user_activity_session', ['sessionId'])
export class UserActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 20, name: 'user_type' })
  userType: string;

  @Column({ type: 'varchar', length: 100, name: 'user_email' })
  userEmail: string;

  @Column({ type: 'varchar', length: 50, name: 'activity_type' })
  activityType: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'resource_type',
  })
  resourceType: string;

  @Column({ type: 'uuid', nullable: true, name: 'resource_id' })
  resourceId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @Column({ type: 'inet', nullable: true, name: 'ip_address' })
  ipAddress: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'session_id' })
  sessionId: string;

  @Column({ type: 'boolean', default: true })
  success: boolean;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage: string;

  @Column({ type: 'integer', nullable: true, name: 'execution_time_ms' })
  executionTimeMs: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
