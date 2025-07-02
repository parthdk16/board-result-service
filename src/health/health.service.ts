import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from '../result/entities_old/result.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
  ) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'result-microservice',
      version: '1.0.0',
    };
  }

  async readiness() {
    try {
      // Check database connectivity
      await this.resultRepository.query('SELECT 1');
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
        },
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'error',
        },
        error: error.message,
      };
    }
  }
}
