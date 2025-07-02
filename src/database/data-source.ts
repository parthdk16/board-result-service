// src/database/data-source.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
// import { Result } from '../result/entities_old/result.entity';
import { AcademicYear } from '../result/entities/academic-year.entity';
import { AcademicYearSubject } from '../result/entities/academic-year-subject.entity';
import { AuditLog } from '../result/entities/audit-log.entity';
import { ClassLevel } from '../result/entities/class-level.entity';
import { Examination } from '../result/entities/examination.entity';
import { NotificationRequest } from '../result/entities/notification-request.entity';
import { Stream } from '../result/entities/stream.entity';
import { Student } from '../result/entities/student.entity';
import { StudentResult } from '../result/entities/student-result.entity';
import { Subject } from '../result/entities/subject.entity';
import { SubjectResult } from '../result/entities/subject-result.entity';
import { UserActivityLog } from '../result/entities/user-activity-log.entity';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: configService.get('DATABASE_URL'),
  host: configService.get('DB_HOST'),
  port: parseInt(configService.get('DB_PORT', '5432')),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [
    AcademicYear,
    AcademicYearSubject,
    AuditLog,
    ClassLevel,
    Examination,
    NotificationRequest,
    Stream,
    Student,
    StudentResult,
    Subject,
    SubjectResult,
    UserActivityLog,
  ],
  migrations: ['src/migrations/*.ts'],
  // synchronize: configService.get('NODE_ENV') === 'development',
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
  ssl:
    configService.get('NODE_ENV') === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
