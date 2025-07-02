import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';

export interface ResultNotificationPayload {
  studentId: string;
  resultId: string;
  type: 'RESULT_PUBLISHED' | 'RESULT_UPDATED' | 'RESULT_DELETED';
  boardType: string;
  classGrade: string;
  resultStatus: string;
  rollNumber: string;
  timestamp?: Date;
  metadata?: any;
}

@Injectable()
export class NotificationProducer {
  private readonly logger = new Logger(NotificationProducer.name);
  private connection: Connection;
  private channel: Channel;
  private readonly queueName: string;
  private readonly rabbitmqUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.rabbitmqUrl = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://localhost:5672',
    );
    this.queueName = this.configService.get<string>(
      'RABBITMQ_QUEUE_NOTIFICATIONS',
      'result_notifications',
    );
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      this.logger.log('Connecting to RabbitMQ...');

      this.connection = (await amqp.connect(
        this.rabbitmqUrl,
      )) as unknown as Connection;
      this.channel = (await this.connection.createChannel()) as Channel;
      // Declare the queue
      await this.channel.assertQueue(this.queueName, {
        durable: true,
        arguments: {
          'x-queue-type': 'classic',
        },
      });

      // Declare exchange for result notifications
      await this.channel.assertExchange('result_notifications', 'topic', {
        durable: true,
      });

      // Bind queue to exchange
      await this.channel.bindQueue(
        this.queueName,
        'result_notifications',
        'result.*',
      );

      this.logger.log('Connected to RabbitMQ successfully');

      // Handle connection errors
      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });

    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      // Don't throw error to prevent app from crashing
      // Notifications will fail silently
    }
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  async publishResultNotification(
    payload: ResultNotificationPayload,
  ): Promise<void> {
    try {
      if (!this.channel) {
        this.logger.warn(
          'RabbitMQ channel not available, skipping notification',
        );
        return;
      }

      const message = {
        ...payload,
        timestamp: new Date(),
        service: 'board-result-service',
      };

      const routingKey = `result.${payload.type.toLowerCase()}`;

      const published = this.channel.publish(
        'result_notifications',
        routingKey,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          contentType: 'application/json',
          messageId: `${payload.resultId}-${Date.now()}`,
          timestamp: Date.now(),
        }
      );

      if (published) {
        this.logger.debug(
          `Notification published: ${payload.type} for result ${payload.resultId}`,
        );
      } else {
        this.logger.warn(
          `Failed to publish notification: ${payload.type} for result ${payload.resultId}`,
        );
      }

    } catch (error) {
      this.logger.error(`Failed to publish notification:`, error);
      // Don't throw error to prevent transaction rollback
    }
  }

  async publishBulkResultNotification(
    payloads: ResultNotificationPayload[],
  ): Promise<void> {
    try {
      if (!this.channel) {
        this.logger.warn(
          'RabbitMQ channel not available, skipping bulk notification',
        );
        return;
      }

      const promises = payloads.map((payload) =>
        this.publishResultNotification(payload),
      );
      await Promise.allSettled(promises);

      this.logger.log(
        `Bulk notification published for ${payloads.length} results`,
      );
    } catch (error) {
      this.logger.error('Failed to publish bulk notifications:', error);
    }
  }

  async publishResultStatistics(stats: any): Promise<void> {
    try {
      if (!this.channel) {
        this.logger.warn('RabbitMQ channel not available, skipping statistics');
        return;
      }

      const message = {
        type: 'RESULT_STATISTICS',
        stats,
        timestamp: new Date(),
        service: 'board-result-service',
      };

      const published = this.channel.publish(
        'result_notifications',
        'result.statistics',
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          contentType: 'application/json',
          messageId: `stats-${Date.now()}`,
          timestamp: Date.now(),
        }
      );

      if (published) {
        this.logger.debug('Result statistics published');
      }

    } catch (error) {
      this.logger.error('Failed to publish result statistics:', error);
    }
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      return !!(this.connection && !this.connection.closed && this.channel);
    } catch (error) {
      return false;
    }
  }

  // Reconnect method
  async reconnect(): Promise<void> {
    try {
      await this.disconnect();
      await this.connect();
    } catch (error) {
      this.logger.error('Failed to reconnect to RabbitMQ:', error);
    }
  }
}
