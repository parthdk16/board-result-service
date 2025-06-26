// src/notification-producer/notification.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationProducer } from './notifcation.producer';

@Module({
  imports: [ConfigModule],
  providers: [NotificationProducer],
  exports: [NotificationProducer],
})
export class NotificationModule {}
