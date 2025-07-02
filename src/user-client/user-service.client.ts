// user-service.client.ts
import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { of } from 'rxjs';

export interface UserData {
  id: string;
  email: string;
  role: string;
  name: string;
  studentId?: string;
  isActive: boolean;
}

@Injectable()
export class UserServiceClient {
  private readonly logger = new Logger(UserServiceClient.name);
  private readonly userServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.userServiceUrl =
      this.configService.get<string>('USER_SERVICE_URL') ||
      'http://localhost:3001/api/v1';
  }

  async validateToken(token: string): Promise<UserData> {
    try {
      this.logger.log('Validating token with user service');

      const response = await firstValueFrom(
        this.httpService
          .post(
            `${this.userServiceUrl}/users/auth/validate`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              timeout: 5000,
            },
          )
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error(`Token validation failed: ${error.message}`);
              throw new HttpException('Token validation failed', 401);
            }),
          ),
      );

      if (!response.data.success) {
        throw new HttpException('Invalid token response', 401);
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      throw new HttpException('Token validation failed', 401);
    }
  }

  async getUserById(userId: string): Promise<UserData | null> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.userServiceUrl}/users/internal/validate/${userId}`)
          .pipe(
            timeout(3000),
            catchError((error) => {
              this.logger.warn(
                `Failed to get user ${userId}: ${error.message}`,
              );
              return of({
                data: { success: false, data: { exists: false, user: null } },
              });
            }),
          ),
      );

      if (response.data.success && response.data.data.exists) {
        return response.data.data.user;
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to get user ${userId}: ${error.message}`);
      return null;
    }
  }

  async getUserRole(userId: string): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.userServiceUrl}/users/internal/role/${userId}`)
          .pipe(
            timeout(3000),
            catchError((error) => {
              this.logger.warn(
                `Failed to get user role ${userId}: ${error.message}`,
              );
              return of({ data: { success: false } });
            }),
          ),
      );

      if (response.data.success) {
        return response.data.data.role;
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to get user role ${userId}: ${error.message}`);
      return null;
    }
  }
}

// // clients/user-service.client.ts
// import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';
// import { catchError, map, firstValueFrom } from 'rxjs';
// import { UserRole } from '../common/enums/role.enum';

// export interface UserValidationResponse {
//   success: boolean;
//   data: {
//     exists: boolean;
//     user: {
//       _id: string;
//       email: string;
//       name: string;
//       role: UserRole;
//       studentId?: string;
//       isActive: boolean;
//     } | null;
//   };
// }

// export interface UserRoleResponse {
//   success: boolean;
//   data: {
//     role: UserRole;
//   };
// }

// @Injectable()
// export class UserServiceClient {
//   private readonly logger = new Logger(UserServiceClient.name);
//   private readonly userServiceUrl: string;

//   constructor(
//     private readonly httpService: HttpService,
//     private readonly configService: ConfigService,
//   ) {
//     this.userServiceUrl = this.configService.get<string>(
//       'USER_SERVICE_URL',
//       'http://localhost:3001',
//     );
//   }

//   async validateUser(userId: string): Promise<UserValidationResponse> {
//     try {
//       this.logger.log(`Validating user with ID: ${userId}`);

//       const response = await firstValueFrom(
//         this.httpService
//           .get<UserValidationResponse>(
//             `${this.userServiceUrl}/users/internal/validate/${userId}`,
//           )
//           .pipe(
//             map((res) => res.data),
//             catchError((error) => {
//               this.logger.error(
//                 `Error validating user ${userId}:`,
//                 error.message,
//               );
//               throw new HttpException(
//                 'User service unavailable',
//                 HttpStatus.SERVICE_UNAVAILABLE,
//               );
//             }),
//           ),
//       );

//       this.logger.log(
//         `User validation result for ${userId}: ${response.data.exists}`,
//       );
//       return response;
//     } catch (error) {
//       this.logger.error(`Failed to validate user ${userId}:`, error.message);
//       throw error;
//     }
//   }

//   async getUserRole(userId: string): Promise<UserRole> {
//     try {
//       this.logger.log(`Getting role for user: ${userId}`);

//       const response = await firstValueFrom(
//         this.httpService
//           .get<UserRoleResponse>(
//             `${this.userServiceUrl}/users/internal/role/${userId}`,
//           )
//           .pipe(
//             map((res) => res.data),
//             catchError((error) => {
//               this.logger.error(
//                 `Error getting user role ${userId}:`,
//                 error.message,
//               );
//               throw new HttpException(
//                 'User service unavailable',
//                 HttpStatus.SERVICE_UNAVAILABLE,
//               );
//             }),
//           ),
//       );

//       this.logger.log(`User role for ${userId}: ${response.data.role}`);
//       return response.data.role;
//     } catch (error) {
//       this.logger.error(`Failed to get user role ${userId}:`, error.message);
//       throw error;
//     }
//   }

//   async validateUserExists(userId: string): Promise<boolean> {
//     try {
//       const response = await this.validateUser(userId);
//       return response.data.exists;
//     } catch (error) {
//       this.logger.error(
//         `Error checking if user exists ${userId}:`,
//         error.message,
//       );
//       return false;
//     }
//   }

//   async isUserModerator(userId: string): Promise<boolean> {
//     try {
//       const role = await this.getUserRole(userId);
//       return role === UserRole.MODERATOR;
//     } catch (error) {
//       this.logger.error(
//         `Error checking if user is moderator ${userId}:`,
//         error.message,
//       );
//       return false;
//     }
//   }

//   async getStudentData(userId: string): Promise<any> {
//     try {
//       const validation = await this.validateUser(userId);
//       if (!validation.data.exists || !validation.data.user) {
//         throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
//       }

//       const user = validation.data.user;
//       if (user.role !== UserRole.STUDENT) {
//         throw new HttpException(
//           'User is not a student',
//           HttpStatus.BAD_REQUEST,
//         );
//       }

//       return {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         studentId: user.studentId,
//         isActive: user.isActive,
//       };
//     } catch (error) {
//       this.logger.error(`Error getting student data ${userId}:`, error.message);
//       throw error;
//     }
//   }
// }
