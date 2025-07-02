import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { Result } from '../result/entities_old/result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Result])],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
