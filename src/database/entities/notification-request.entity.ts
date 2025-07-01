// src/database/entities/notification-request.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { StudentResult } from './student-result.entity';

@Entity('notification_requests')
@Index('idx_notifications_status', ['status'])
@Index('idx_notifications_created', ['createdAt'])
export class NotificationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, name: 'notification_type' })
  notificationType: string;

  @Column({ type: 'varchar', length: 100, name: 'recipient_email' })
  recipientEmail: string;

  @Column({ type: 'varchar', length: 200, name: 'recipient_name' })
  recipientName: string;

  @Column({ type: 'jsonb', name: 'message_data' })
  messageData: any;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'processed_at' })
  processedAt: Date;

  // Relations
  @ManyToOne(
    () => StudentResult,
    (studentResult) => studentResult.notificationRequests,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'student_result_id' })
  studentResult: StudentResult;
}
