// src/user-client/user-client.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, timeout } from 'rxjs';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

@Injectable()
export class UserClientService {
  private readonly logger = new Logger(UserClientService.name);
  private readonly userServiceUrl: string | undefined;
  private readonly apiKey: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
    this.apiKey = this.configService.get<string>('USER_SERVICE_API_KEY');
  }

  async validateUser(userId: string): Promise<UserDto | null> {
    try {
      this.logger.debug(`Validating user with ID: ${userId}`);

      const response = await firstValueFrom(
        this.httpService
          .get(`${this.userServiceUrl}/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          })
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error(`Error validating user ${userId}:`, error.message);
              throw new HttpException(
                'Failed to validate user',
                HttpStatus.SERVICE_UNAVAILABLE,
              );
            })
          ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to validate user ${userId}:`, error.message);

      if (error.response?.status === 404) {
        return null;
      }

      throw new HttpException(
        'User service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async verifyStudent(studentId: string): Promise<boolean> {
    try {
      this.logger.debug(`Verifying student with ID: ${studentId}`);

      const user = await this.validateUser(studentId);

      if (!user) {
        return false;
      }

      // Check if user has student role or is active
      return user.isActive && (user.role === 'STUDENT' || user.role === 'USER');
    } catch (error) {
      this.logger.error(
        `Failed to verify student ${studentId}:`,
        error.message,
      );
      return false;
    }
  }

  async getUsersByIds(userIds: string[]): Promise<UserDto[]> {
    try {
      this.logger.debug(`Fetching users by IDs: ${userIds.length} users`);

      const response = await firstValueFrom(
        this.httpService
          .post(
            `${this.userServiceUrl}/users/bulk`,
            { userIds },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            },
          )
          .pipe(
            timeout(10000),
            catchError((error) => {
              this.logger.error('Error fetching users by IDs:', error.message);
              throw new HttpException(
                'Failed to fetch users',
                HttpStatus.SERVICE_UNAVAILABLE,
              );
            })
          )
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch users by IDs:', error.message);
      throw new HttpException(
        'User service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getUserProfile(userId: string): Promise<UserDto> {
    const user = await this.validateUser(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async isUserActive(userId: string): Promise<boolean> {
    try {
      const user = await this.validateUser(userId);
      return user?.isActive || false;
    } catch (error) {
      this.logger.error(
        `Failed to check user status ${userId}:`,
        error.message,
      );
      return false;
    }
  }

  async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const user = await this.validateUser(userId);
      return user?.role === role || false;
    } catch (error) {
      this.logger.error(`Failed to check user role ${userId}:`, error.message);
      return false;
    }
  }
}
