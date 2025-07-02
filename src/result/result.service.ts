import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from './entities_old/result.entity';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { QueryResultDto } from './dto/query-result.dto';
import { UserServiceClient } from '../user-client/user-service.client';

@Injectable()
export class ResultService {
  private readonly logger = new Logger(ResultService.name);

  constructor(
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
    private readonly userServiceClient: UserServiceClient,
  ) {}

  /**
   * Calculate grade based on percentage
   */
  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'F';
  }

  /**
   * Determine result status based on percentage and passing criteria
   */
  private determineResultStatus(percentage: number): string {
    return percentage >= 40 ? 'PASS' : 'FAIL';
  }

  /**
   * Create a new result
   */
  async create(
    createResultDto: CreateResultDto,
    teacherId: string,
  ): Promise<Result> {
    try {
      this.logger.debug(
        `Creating result for student: ${createResultDto.studentId}`,
      );

      // Validate student exists using user service
      const studentValidation = await this.userServiceClient.validateUser(
        createResultDto.studentId,
      );
      if (!studentValidation.success || !studentValidation.data.exists) {
        throw new NotFoundException('Student not found');
      }

      const student = studentValidation.data.user;

      if (!student) {
        throw new BadRequestException('No student');
      }

      if (student.role !== 'STUDENT') {
        throw new BadRequestException('Provided user ID is not a student');
      }

      // Check for duplicate result
      const existingResult = await this.resultRepository.findOne({
        where: {
          studentId: createResultDto.studentId,
          boardType: createResultDto.boardType,
          classGrade: createResultDto.classGrade,
          academicYear: createResultDto.academicYear,
          rollNumber: createResultDto.rollNumber,
        },
      });

      if (existingResult) {
        throw new ConflictException(
          'Result already exists for this student, board, class, and academic year',
        );
      }

      // Calculate derived fields
      let percentage = 0;
      if (createResultDto.totalMarks && createResultDto.obtainedMarks) {
        percentage =
          (createResultDto.obtainedMarks / createResultDto.totalMarks) * 100;
        percentage = Math.round(percentage * 100) / 100; // Round to 2 decimal places
      }

      const resultStatus =
        createResultDto.resultStatus || this.determineResultStatus(percentage);
      const overallGrade =
        createResultDto.overallGrade || this.calculateGrade(percentage);

      // Create result entity
      const result = this.resultRepository.create({
        ...createResultDto,
        studentName: student.name,
        percentage,
        overallGrade,
        resultStatus,
        createdBy: teacherId,
        isPublished: createResultDto.isPublished || false,
        publishedAt: createResultDto.isPublished ? new Date() : undefined,
        publishedBy: createResultDto.isPublished ? teacherId : undefined,
      });

      const savedResult: Result = await this.resultRepository.save(result);

      this.logger.log(`Result created successfully with ID: ${savedResult.id}`);
      return savedResult;
      // } catch (error) {
      //   this.logger.error(`Error creating result: ${error.message}`, error.stack);
      //   throw error;
      // }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error creating result: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Unknown error occurred while creating result',
          String(error),
        );
      }
      throw error;
    }
  }

  /**
   * Find all results with filters and pagination
   */
  async findAll(queryDto: QueryResultDto): Promise<{
    results: Result[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      this.logger.debug('Fetching results with filters', queryDto);

      const {
        page = 1,
        limit = 10,
        studentId,
        boardType,
        classGrade,
        academicYear,
        rollNumber,
        resultStatus,
        isPublished,
      } = queryDto;

      const offset = (page - 1) * limit;

      const queryBuilder = this.resultRepository.createQueryBuilder('result');

      // Apply filters
      if (studentId) {
        queryBuilder.andWhere('result.studentId = :studentId', { studentId });
      }

      if (boardType) {
        queryBuilder.andWhere('result.boardType = :boardType', { boardType });
      }

      if (classGrade) {
        queryBuilder.andWhere('result.classGrade = :classGrade', {
          classGrade,
        });
      }

      if (academicYear) {
        queryBuilder.andWhere('result.academicYear = :academicYear', {
          academicYear,
        });
      }

      if (rollNumber) {
        queryBuilder.andWhere('result.rollNumber ILIKE :rollNumber', {
          rollNumber: `%${rollNumber}%`,
        });
      }

      if (resultStatus) {
        queryBuilder.andWhere('result.resultStatus = :resultStatus', {
          resultStatus,
        });
      }

      if (isPublished !== undefined) {
        queryBuilder.andWhere('result.isPublished = :isPublished', {
          isPublished,
        });
      }

      // Pagination and ordering
      queryBuilder.orderBy('result.createdAt', 'DESC').skip(offset).take(limit);

      const [results, total] = await queryBuilder.getManyAndCount();

      return {
        results,
        total,
        page: Number(page),
        limit: Number(limit),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error creating result: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Unknown error occurred while creating result',
          String(error),
        );
      }
      throw error;
    }
  }

  /**
   * Find a single result by ID
   */
  async findOne(id: string): Promise<Result> {
    try {
      this.logger.debug(`Fetching result with ID: ${id}`);

      const result = await this.resultRepository.findOne({
        where: { id },
      });

      if (!result) {
        throw new NotFoundException(`Result with ID ${id} not found`);
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding result by ID: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Unknown error occurred while finding result',
          String(error),
        );
      }
      throw error;
    }
  }

  /**
   * Find all results for a specific student
   */
  async findByStudent(studentId: string): Promise<Result[]> {
    try {
      this.logger.debug(`Fetching results for student: ${studentId}`);

      // Validate student exists
      const studentValidation =
        await this.userServiceClient.validateUser(studentId);
      if (!studentValidation.success || !studentValidation.data.exists) {
        throw new NotFoundException('Student not found');
      }

      const results = await this.resultRepository.find({
        where: {
          studentId,
          isPublished: true, // Only return published results for student queries
        },
        order: {
          academicYear: 'DESC',
          createdAt: 'DESC',
        },
      });

      return results;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error finding result for student: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Unknown error occurred while finding result for student',
          String(error),
        );
      }
      throw error;
    }
  }

  /**
   * Update a result
   */
  async update(
    id: string,
    updateResultDto: UpdateResultDto,
    teacherId: string,
  ): Promise<Result> {
    try {
      this.logger.debug(`Updating result with ID: ${id}`);

      const result = await this.findOne(id);

      // If result is already published, restrict certain updates
      if (result.isPublished) {
        // Allow only specific fields to be updated for published results
        const allowedFields = ['remarks', 'isPublished'];
        const updateFields = Object.keys(updateResultDto);
        const restrictedFields = updateFields.filter(
          (field) => !allowedFields.includes(field),
        );
        if (restrictedFields.length > 0) {
          throw new BadRequestException(
            `Cannot update fields [${restrictedFields.join(', ')}] for published results`,
          );
        }
      }

      // If student ID is being updated, validate the new student
      if (
        updateResultDto.studentId &&
        updateResultDto.studentId !== result.studentId
      ) {
        const studentValidation = await this.userServiceClient.validateUser(
          updateResultDto.studentId,
        );

        if (!studentValidation.success || !studentValidation.data.exists) {
          throw new NotFoundException('Student not found');
        }

        // updateResultDto.studentName = studentValidation.data.user.name;
        if (!studentValidation.data.user) {
          throw new NotFoundException('Student data is missing');
        }
        updateResultDto.studentName = studentValidation.data.user.name;
      }

      // Recalculate derived fields if marks are updated
      if (
        updateResultDto.totalMarks !== undefined ||
        updateResultDto.obtainedMarks !== undefined
      ) {
        const totalMarks = updateResultDto.totalMarks ?? result.totalMarks;
        const obtainedMarks =
          updateResultDto.obtainedMarks ?? result.obtainedMarks;

        if (totalMarks && obtainedMarks) {
          const percentage = (obtainedMarks / totalMarks) * 100;
          updateResultDto.percentage = Math.round(percentage * 100) / 100;
          updateResultDto.resultStatus =
            updateResultDto.resultStatus ||
            this.determineResultStatus(percentage);
          updateResultDto.overallGrade =
            updateResultDto.overallGrade || this.calculateGrade(percentage);
        }
      }

      // Handle publication status change
      if (updateResultDto.isPublished !== undefined) {
        if (updateResultDto.isPublished && !result.isPublished) {
          // Publishing the result
          updateResultDto.publishedAt = new Date();
          updateResultDto.publishedBy = teacherId;
        } else if (!updateResultDto.isPublished && result.isPublished) {
          // Unpublishing the result
          updateResultDto.publishedAt = null;
          updateResultDto.publishedBy = null;
        }
      }

      // Update the result
      Object.assign(result, updateResultDto);
      result.updatedAt = new Date();

      const updatedResult = await this.resultRepository.save(result);

      this.logger.log(`Result updated successfully with ID: ${id}`);
      return updatedResult;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error updating result: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Unknown error occurred while updating result',
          String(error),
        );
      }
      throw error;
    }
  }

  /**
   * Remove (soft delete) a result
   */
  async remove(id: string): Promise<void> {
    try {
      this.logger.debug(`Removing result with ID: ${id}`);

      const result = await this.findOne(id);

      if (result.isPublished) {
        throw new BadRequestException('Cannot delete published results');
      }

      await this.resultRepository.remove(result);

      this.logger.log(`Result removed successfully with ID: ${id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error removing result with ID: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Unknown error occurred while removing result with ID',
          String(error),
        );
      }
      throw error;
    }
  }
}

// // result.service.ts
// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
//   ConflictException,
//   Logger,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Result } from './entities/result.entity';
// import { CreateResultDto } from './dto/create-result.dto';
// import { UpdateResultDto } from './dto/update-result.dto';
// import { QueryResultDto } from './dto/query-result.dto';
// import { UserServiceClient } from '../user-client/user-service.client';

// @Injectable()
// export class ResultService {
//   private readonly logger = new Logger(ResultService.name);

//   constructor(
//     @InjectRepository(Result)
//     private readonly resultRepository: Repository<Result>,
//     private readonly userServiceClient: UserServiceClient,
//   ) {}

//   /**
//    * Calculate grade based on percentage
//    */
//   private calculateGrade(percentage: number): string {
//     if (percentage >= 90) return 'A+';
//     if (percentage >= 80) return 'A';
//     if (percentage >= 70) return 'B+';
//     if (percentage >= 60) return 'B';
//     if (percentage >= 50) return 'C+';
//     if (percentage >= 40) return 'C';
//     return 'F';
//   }

//   /**
//    * Calculate CGPA based on percentage
//    */
//   private calculateCGPA(percentage: number): number {
//     if (percentage >= 90) return 10.0;
//     if (percentage >= 80) return 9.0;
//     if (percentage >= 70) return 8.0;
//     if (percentage >= 60) return 7.0;
//     if (percentage >= 50) return 6.0;
//     if (percentage >= 40) return 5.0;
//     return 0.0;
//   }

//   /**
//    * Determine result status based on percentage and passing criteria
//    */
//   private determineResultStatus(percentage: number): string {
//     return percentage >= 40 ? 'PASS' : 'FAIL';
//   }

//   /**
//    * Create a new result
//    */
//   async create(
//     createResultDto: CreateResultDto,
//     teacherId: string,
//   ): Promise<Result> {
//     try {
//       this.logger.debug(
//         `Creating result for student: ${createResultDto.studentId}`,
//       );

//       // Validate student exists using user service
//       const studentValidation = await this.userServiceClient.validateUser(
//         createResultDto.studentId,
//       );
//       if (!studentValidation.success || !studentValidation.data.exists) {
//         throw new NotFoundException('Student not found');
//       }

//       const student = studentValidation.data.user;

//       if (!student) {
//         throw new BadRequestException('No student');
//       }

//       if (student.role !== 'STUDENT') {
//         throw new BadRequestException('Provided user ID is not a student');
//       }

//       // Check for duplicate result
//       const existingResult = await this.resultRepository.findOne({
//         where: {
//           studentId: createResultDto.studentId,
//           boardType: createResultDto.boardType,
//           classGrade: createResultDto.classGrade,
//           academicYear: createResultDto.academicYear,
//           rollNumber: createResultDto.rollNumber,
//         },
//       });

//       if (existingResult) {
//         throw new ConflictException(
//           'Result already exists for this student, board, class, and academic year'
//         );
//       }

//       // Calculate derived fields
//       let percentage = 0;
//       if (createResultDto.totalMarks && createResultDto.obtainedMarks) {
//         percentage =
//          (createResultDto.obtainedMarks / createResultDto.totalMarks) * 100;
//         percentage = Math.round(percentage * 100) / 100; // Round to 2 decimal places
//       }

//       const resultStatus =
//         createResultDto.resultStatus || this.determineResultStatus(percentage);
//       const overallGrade = createResultDto.overallGrade || this.calculateGrade(percentage);
//       const cgpa = this.calculateCGPA(percentage);

//       // Create result entity
//       const result = this.resultRepository.create({
//         ...createResultDto,
//         studentName: student.name,
//         percentage,
//         overallGrade,
//         cgpa: Math.round(cgpa * 100) / 100,
//         resultStatus,
//         createdBy: teacherId,
//         isPublished: createResultDto.isPublished || false,
//         publishedAt: createResultDto.isPublished ? new Date() : null,
//         publishedBy: createResultDto.isPublished ? teacherId : null,
//       });

//       const savedResult = await this.resultRepository.save(result);

//       this.logger.log(`Result created successfully with ID: ${savedResult.id}`);
//       return savedResult;
//     } catch (error) {
//       this.logger.error(`Error creating result: ${error.message}`, error.stack);
//       throw error;
//     }
//   }

//   /**
//    * Find all results with filters and pagination
//    */
//   async findAll(queryDto: QueryResultDto): Promise<{
//     results: Result[];
//     total: number;
//     page: number;
//     limit: number;
//   }> {
//     try {
//       this.logger.debug('Fetching results with filters', queryDto);

//       const {
//         page = 1,
//         limit = 10,
//         studentId,
//         boardType,
//         classGrade,
//         academicYear,
//         rollNumber,
//         resultStatus,
//         isPublished,
//       } = queryDto;

//       const offset = (page - 1) * limit;

//       const queryBuilder = this.resultRepository.createQueryBuilder('result');

//       // Apply filters
//       if (studentId) {
//         queryBuilder.andWhere('result.studentId = :studentId', { studentId });
//       }

//       if (boardType) {
//         queryBuilder.andWhere('result.boardType = :boardType', { boardType });
//       }

//       if (classGrade) {
//         queryBuilder.andWhere('result.classGrade = :classGrade', {
//           classGrade,
//         });
//       }

//       if (academicYear) {
//         queryBuilder.andWhere('result.academicYear = :academicYear', {
//           academicYear,
//         });
//       }

//       if (rollNumber) {
//         queryBuilder.andWhere('result.rollNumber ILIKE :rollNumber', {
//           rollNumber: `%${rollNumber}%`,
//         });
//       }

//       if (resultStatus) {
//         queryBuilder.andWhere('result.resultStatus = :resultStatus', {
//           resultStatus,
//         });
//       }

//       if (isPublished !== undefined) {
//         queryBuilder.andWhere('result.isPublished = :isPublished', {
//           isPublished,
//         });
//       }

//       // Pagination and ordering
//       queryBuilder.orderBy('result.createdAt', 'DESC').skip(offset).take(limit);

//       const [results, total] = await queryBuilder.getManyAndCount();

//       return {
//         results,
//         total,
//         page: Number(page),
//         limit: Number(limit),
//       };

//     } catch (error) {
//       this.logger.error(`Error finding results: ${error.message}`, error.stack);
//       throw error;
//     }
//   }

//   /**
//    * Find a single result by ID
//    */
//   async findOne(id: string): Promise<Result> {
//     try {
//       this.logger.debug(`Fetching result with ID: ${id}`);

//       const result = await this.resultRepository.findOne({
//         where: { id },
//       });

//       if (!result) {
//         throw new NotFoundException(`Result with ID ${id} not found`);
//       }

//       return result;
//     } catch (error) {
//       this.logger.error(
//         `Error finding result by ID: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   /**
//    * Find all results for a specific student
//    */
//   async findByStudent(studentId: string): Promise<Result[]> {
//     try {
//       this.logger.debug(`Fetching results for student: ${studentId}`);

//       // Validate student exists
//       const studentValidation =
//         await this.userServiceClient.validateUser(studentId);
//       if (!studentValidation.success || !studentValidation.data.exists) {
//         throw new NotFoundException('Student not found');
//       }

//       const results = await this.resultRepository.find({
//         where: {
//           studentId,
//           isPublished: true // Only return published results for student queries
//         },
//         order: {
//           academicYear: 'DESC',
//           createdAt: 'DESC',
//         },
//       });

//       return results;
//     } catch (error) {
//       this.logger.error(
//         `Error finding results for student: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   /**
//    * Find results by roll number
//    */
//   async findByRollNumber(
//     rollNumber: string,
//     boardType?: string,
//     academicYear?: string,
//   ): Promise<Result[]> {
//     try {
//       this.logger.debug(`Searching results by roll number: ${rollNumber}`);

//       const whereCondition: any = {
//         rollNumber,
//         isPublished: true, // Only return published results
//       };

//       if (boardType) {
//         whereCondition.boardType = boardType;
//       }

//       if (academicYear) {
//         whereCondition.academicYear = academicYear;
//       }

//       const results = await this.resultRepository.find({
//         where: whereCondition,
//         order: { createdAt: 'DESC' },
//       });

//       return results;

//     } catch (error) {
//       this.logger.error(
//         `Error finding results by roll number: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   /**
//    * Update a result
//    */
//   async update(
//     id: string,
//     updateResultDto: UpdateResultDto,
//     teacherId: string,
//   ): Promise<Result> {
//     try {
//       this.logger.debug(`Updating result with ID: ${id}`);

//       const result = await this.findOne(id);

//       // If result is already published, restrict certain updates
//       if (result.isPublished) {
//         // Allow only specific fields to be updated for published results
//         const allowedFields = ['remarks', 'isPublished'];
//         const updateFields = Object.keys(updateResultDto);
//         const restrictedFields = updateFields.filter(
//           (field) => !allowedFields.includes(field),
//         );
//         if (restrictedFields.length > 0) {
//           throw new BadRequestException(
//             `Cannot update fields [${restrictedFields.join(', ')}] for published results`
//           );
//         }
//       }

//       // If student ID is being updated, validate the new student
//       if (
//         updateResultDto.studentId &&
//         updateResultDto.studentId !== result.studentId
//       ) {
//         const studentValidation = await this.userServiceClient.validateUser(updateResultDto.studentId);
//         if (!studentValidation.success || !studentValidation.data.exists) {
//           throw new NotFoundException('Student not found');
//         }
//         updateResultDto.studentName = studentValidation.data.user.name;
//       }

//       // Recalculate derived fields if marks are updated
//       if (
//         updateResultDto.totalMarks !== undefined ||
//         updateResultDto.obtainedMarks !== undefined
//       ) {
//         const totalMarks = updateResultDto.totalMarks ?? result.totalMarks;
//         const obtainedMarks =
//           updateResultDto.obtainedMarks ?? result.obtainedMarks;

//         if (totalMarks && obtainedMarks) {
//           const percentage = (obtainedMarks / totalMarks) * 100;
//           updateResultDto.percentage = Math.round(percentage * 100) / 100;
//           updateResultDto.resultStatus =
//             updateResultDto.resultStatus ||
//             this.determineResultStatus(percentage);
//           updateResultDto.overallGrade =
//             updateResultDto.overallGrade || this.calculateGrade(percentage);
//           updateResultDto.cgpa =
//            Math.round(this.calculateCGPA(percentage) * 100) / 100;
//         }
//       }

//       // Handle publication status change
//       if (updateResultDto.isPublished !== undefined) {
//         if (updateResultDto.isPublished && !result.isPublished) {
//           // Publishing the result
//           updateResultDto.publishedAt = new Date();
//           updateResultDto.publishedBy = teacherId;
//         } else if (!updateResultDto.isPublished && result.isPublished) {
//           // Unpublishing the result
//           updateResultDto.publishedAt = null;
//           updateResultDto.publishedBy = null;
//         }
//       }

//       // Update the result
//       Object.assign(result, updateResultDto);
//       result.updatedAt = new Date();

//       const updatedResult = await this.resultRepository.save(result);

//       this.logger.log(`Result updated successfully with ID: ${id}`);
//       return updatedResult;

//     } catch (error) {
//       this.logger.error(`Error updating result: ${error.message}`, error.stack);
//       throw error;
//     }
//   }

//   /**
//    * Publish a result
//    */
//   async publish(id: string, adminId: string): Promise<Result> {
//     try {
//       this.logger.debug(`Publishing result with ID: ${id}`);

//       const result = await this.findOne(id);

//       if (result.isPublished) {
//         throw new BadRequestException('Result is already published');
//       }

//       result.isPublished = true;
//       result.publishedAt = new Date();
//       result.publishedBy = adminId;
//       result.updatedAt = new Date();

//       const publishedResult = await this.resultRepository.save(result);

//       this.logger.log(`Result published successfully with ID: ${id}`);
//       return publishedResult;
//     } catch (error) {
//       this.logger.error(
//         `Error publishing result: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   /**
//    * Unpublish a result
//    */
//   async unpublish(id: string): Promise<Result> {
//     try {
//       this.logger.debug(`Unpublishing result with ID: ${id}`);

//       const result = await this.findOne(id);

//       if (!result.isPublished) {
//         throw new BadRequestException('Result is not published');
//       }

//       result.isPublished = false;
//       result.publishedAt = null;
//       result.publishedBy = null;
//       result.updatedAt = new Date();

//       const unpublishedResult = await this.resultRepository.save(result);

//       this.logger.log(`Result unpublished successfully with ID: ${id}`);
//       return unpublishedResult;
//     } catch (error) {
//       this.logger.error(
//         `Error unpublishing result: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   /**
//    * Remove (soft delete) a result
//    */
//   async remove(id: string): Promise<void> {
//     try {
//       this.logger.debug(`Removing result with ID: ${id}`);

//       const result = await this.findOne(id);

//       if (result.isPublished) {
//         throw new BadRequestException('Cannot delete published results');
//       }

//       await this.resultRepository.remove(result);

//       this.logger.log(`Result removed successfully with ID: ${id}`);
//     } catch (error) {
//       this.logger.error(`Error removing result: ${error.message}`, error.stack);
//       throw error;
//     }
//   }

//   /**
//    * Get result statistics
//    */
//   async getStatistics(boardType?: string, academicYear?: string): Promise<any> {
//     try {
//       this.logger.debug('Generating result statistics');

//       const queryBuilder = this.resultRepository.createQueryBuilder('result');

//       if (boardType) {
//         queryBuilder.andWhere('result.boardType = :boardType', { boardType });
//       }

//       if (academicYear) {
//         queryBuilder.andWhere('result.academicYear = :academicYear', {
//           academicYear,
//         });
//       }

//       const [
//         totalResults,
//         publishedResults,
//         passResults,
//         failResults,
//         pendingResults,
//         absentResults,
//       ] = await Promise.all([
//         queryBuilder.getCount(),
//         queryBuilder.clone().andWhere('result.isPublished = true').getCount(),
//         queryBuilder
//           .clone()
//           .andWhere('result.resultStatus = :status', { status: 'PASS' })
//           .getCount(),
//         queryBuilder
//           .clone()
//           .andWhere('result.resultStatus = :status', { status: 'FAIL' })
//           .getCount(),
//         queryBuilder
//           .clone()
//           .andWhere('result.resultStatus = :status', { status: 'PENDING' })
//           .getCount(),
//         queryBuilder
//           .clone()
//           .andWhere('result.resultStatus = :status', { status: 'ABSENT' })
//           .getCount(),
//       ]);

//       const unpublishedResults = totalResults - publishedResults;
//       const passPercentage =
//         publishedResults > 0
//           ? Math.round((passResults / publishedResults) * 100 * 100) / 100
//           : 0;

//       // Get grade distribution
//       const gradeDistribution = await this.getGradeDistribution(boardType, academicYear);

//       return {
//         totalResults,
//         publishedResults,
//         unpublishedResults,
//         passResults,
//         failResults,
//         pendingResults,
//         absentResults,
//         passPercentage,
//         gradeDistribution,
//       };
//     } catch (error) {
//       this.logger.error(
//         `Error getting result statistics: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   /**
//    * Get grade distribution for statistics
//    */
//   private async getGradeDistribution(
//     boardType?: string,
//     academicYear?: string,
//   ): Promise<any> {
//     const queryBuilder = this.resultRepository.createQueryBuilder('result');

//     queryBuilder.andWhere('result.isPublished = true');

//     if (boardType) {
//       queryBuilder.andWhere('result.boardType = :boardType', { boardType });
//     }

//     if (academicYear) {
//       queryBuilder.andWhere('result.academicYear = :academicYear', {
//         academicYear,
//       });
//     }

//     const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'F'];
//     const gradeDistribution = {};

//     for (const grade of grades) {
//       const count = await queryBuilder
//         .clone()
//         .andWhere('result.overallGrade = :grade', { grade })
//         .getCount();
//       gradeDistribution[grade] = count;
//     }

//     return gradeDistribution;
//   }

//   /**
//    * Bulk publish results
//    */
//   async bulkPublish(
//     resultIds: string[],
//     adminId: string,
//   ): Promise<{
//     published: number;
//     failed: Array<{ id: string; error: string }>;
//   }> {
//     try {
//       this.logger.debug(`Bulk publishing ${resultIds.length} results`);

//       const failed: Array<{ id: string; error: string }> = [];
//       let published = 0;

//       for (const resultId of resultIds) {
//         try {
//           await this.publish(resultId, adminId);
//           published++;
//         } catch (error) {
//           failed.push({ id: resultId, error: error.message });
//         }
//       }

//       this.logger.log(
//         `Bulk publish completed: ${published} published, ${failed.length} failed`,
//       );
//       return { published, failed };
//     } catch (error) {
//       this.logger.error(`Error in bulk publish: ${error.message}`, error.stack);
//       throw error;
//     }
//   }

//   /**
//    * Get results summary for a student (for dashboard)
//    */
//   async getStudentSummary(studentId: string): Promise<any> {
//     try {
//       const results = await this.resultRepository.find({
//         where: { studentId, isPublished: true },
//         order: { academicYear: 'DESC' },
//       });

//       const totalResults = results.length;
//       const passedResults = results.filter(
//         (r) => r.resultStatus === 'PASS',
//       ).length;
//       const failedResults = results.filter(
//         (r) => r.resultStatus === 'FAIL',
//       ).length;
//       const averagePercentage =
//         totalResults > 0
//           ? results.reduce((sum, r) => sum + (r.percentage || 0), 0) /
//             totalResults
//           : 0;

//       const recentResults = results.slice(0, 5); // Get 5 most recent results

//       return {
//         totalResults,
//         passedResults,
//         failedResults,
//         averagePercentage: Math.round(averagePercentage * 100) / 100,
//         recentResults,
//       };
//     } catch (error) {
//       this.logger.error(
//         `Error getting student summary: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }
// }

// // // src/result/result.service.ts
// // import {
// //   Injectable,
// //   NotFoundException,
// //   ConflictException,
// //   BadRequestException,
// //   Logger,
// // } from '@nestjs/common';
// // import { InjectRepository } from '@nestjs/typeorm';
// // import { Repository } from 'typeorm';
// // import { Result, ResultStatus } from './entities/result.entity';
// // import { CreateResultDto } from './dto/create-result.dto';
// // import { UpdateResultDto } from './dto/update-result.dto';
// // import { QueryResultDto } from './dto/query-result.dto';
// // import { UserClientService } from '../user-client/user-client.service';
// // import { NotificationProducer } from '../notification-producer/notification.producer';

// // @Injectable()
// // export class ResultService {
// //   private readonly logger = new Logger(ResultService.name);

// //   constructor(
// //     @InjectRepository(Result)
// //     private readonly resultRepository: Repository<Result>,
// //     private readonly userClientService: UserClientService,
// //     private readonly notificationProducer: NotificationProducer,
// //   ) {}

// //   async create(
// //     createResultDto: CreateResultDto,
// //     publishedBy?: string,
// //   ): Promise<Result> {
// //     this.logger.debug(
// //       `Creating result for student: ${createResultDto.studentId}`,
// //     );

// //     // Verify student exists
// //     const studentExists = await this.userClientService.verifyStudent(createResultDto.studentId);
// //     if (!studentExists) {
// //       throw new BadRequestException('Student not found in user service');
// //     }

// //     // Check for duplicate result
// //     const existingResult = await this.resultRepository.findOne({
// //       where: {
// //         studentId: createResultDto.studentId,
// //         boardType: createResultDto.boardType,
// //         classGrade: createResultDto.classGrade,
// //         academicYear: createResultDto.academicYear,
// //         rollNumber: createResultDto.rollNumber,
// //       },
// //     });

// //     if (existingResult) {
// //       throw new ConflictException(
// //         'Result already exists for this student, board, class, and academic year'
// //       );
// //     }

// //     // Calculate percentage if marks are provided
// //     if (createResultDto.totalMarks && createResultDto.obtainedMarks) {
// //       createResultDto.percentage = Number(
// //         (
// //           (createResultDto.obtainedMarks / createResultDto.totalMarks) *
// //           100
// //         ).toFixed(2),
// //       );
// //     }

// //     // Determine result status if not provided
// //     if (
// //       !createResultDto.resultStatus &&
// //       createResultDto.percentage !== undefined
// //     ) {
// //       createResultDto.resultStatus =
// //         createResultDto.percentage >= 35
// //           ? ResultStatus.PASS
// //           : ResultStatus.FAIL;
// //     }

// //     const result = this.resultRepository.create({
// //       ...createResultDto,
// //       publishedBy: createResultDto.isPublished ? publishedBy : undefined,
// //       publishedAt: createResultDto.isPublished ? new Date() : undefined,
// //     });

// //     const savedResult = await this.resultRepository.save(result);

// //     // Send notification if published
// //     if (savedResult.isPublished) {
// //       await this.sendResultNotification(savedResult, 'RESULT_PUBLISHED');
// //     }

// //     this.logger.log(`Result created successfully with ID: ${savedResult.id}`);
// //     return savedResult;
// //   }

// //   async findAll(
// //     queryDto: QueryResultDto,
// //   ): Promise<{ results: Result[]; total: number }> {
// //     this.logger.debug('Fetching results with filters', queryDto);

// //     const queryBuilder = this.resultRepository.createQueryBuilder('result');

// //     // Apply filters
// //     if (queryDto.studentId) {
// //       queryBuilder.andWhere('result.studentId = :studentId', {
// //         studentId: queryDto.studentId,
// //       });
// //     }

// //     if (queryDto.boardType) {
// //       queryBuilder.andWhere('result.boardType = :boardType', {
// //         boardType: queryDto.boardType,
// //       });
// //     }

// //     if (queryDto.classGrade) {
// //       queryBuilder.andWhere('result.classGrade = :classGrade', {
// //         classGrade: queryDto.classGrade,
// //       });
// //     }

// //     if (queryDto.academicYear) {
// //       queryBuilder.andWhere('result.academicYear = :academicYear', {
// //         academicYear: queryDto.academicYear,
// //       });
// //     }

// //     if (queryDto.rollNumber) {
// //       queryBuilder.andWhere('result.rollNumber ILIKE :rollNumber', {
// //         rollNumber: `%${queryDto.rollNumber}%`,
// //       });
// //     }

// //     if (queryDto.resultStatus) {
// //       queryBuilder.andWhere('result.resultStatus = :resultStatus', {
// //         resultStatus: queryDto.resultStatus,
// //       });
// //     }

// //     if (queryDto.isPublished !== undefined) {
// //       queryBuilder.andWhere('result.isPublished = :isPublished', {
// //         isPublished: queryDto.isPublished,
// //       });
// //     }

// //     // Pagination
// //     const offset = (queryDto.page - 1) * queryDto.limit;
// //     queryBuilder.skip(offset).take(queryDto.limit);

// //     // Order by creation date (newest first)
// //     queryBuilder.orderBy('result.createdAt', 'DESC');

// //     const [results, total] = await queryBuilder.getManyAndCount();

// //     return { results, total };
// //   }

// //   async findOne(id: string): Promise<Result> {
// //     this.logger.debug(`Fetching result with ID: ${id}`);

// //     const result = await this.resultRepository.findOne({ where: { id } });
// //     if (!result) {
// //       throw new NotFoundException(`Result with ID ${id} not found`);
// //     }

// //     return result;
// //   }

// //   async findByStudent(studentId: string): Promise<Result[]> {
// //     this.logger.debug(`Fetching results for student: ${studentId}`);

// //     return this.resultRepository.find({
// //       where: { studentId },
// //       order: { createdAt: 'DESC' },
// //     });
// //   }

// //   async findByRollNumber(
// //     rollNumber: string,
// //     boardType?: string,
// //     academicYear?: string,
// //   ): Promise<Result[]> {
// //     this.logger.debug(`Searching results by roll number: ${rollNumber}`);

// //     const where: any = { rollNumber };
// //     if (boardType) where.boardType = boardType;
// //     if (academicYear) where.academicYear = academicYear;

// //     return this.resultRepository.find({
// //       where,
// //       order: { createdAt: 'DESC' },
// //     });
// //   }

// //   async update(
// //     id: string,
// //     updateResultDto: UpdateResultDto,
// //     publishedBy?: string,
// //   ): Promise<Result> {
// //     this.logger.debug(`Updating result with ID: ${id}`);

// //     const result = await this.findOne(id);

// //     // Recalculate percentage if marks are updated
// //     if (updateResultDto.totalMarks || updateResultDto.obtainedMarks) {
// //       const totalMarks = updateResultDto.totalMarks ?? result.totalMarks;
// //       const obtainedMarks =
// //         updateResultDto.obtainedMarks ?? result.obtainedMarks;

// //       if (totalMarks && obtainedMarks) {
// //         updateResultDto.percentage = Number(
// //           ((obtainedMarks / totalMarks) * 100).toFixed(2),
// //         );
// //       }
// //     }

// //     // Update result status if percentage changed
// //     if (
// //       updateResultDto.percentage !== undefined &&
// //       !updateResultDto.resultStatus
// //     ) {
// //       updateResultDto.resultStatus =
// //         updateResultDto.percentage >= 35
// //           ? ResultStatus.PASS
// //           : ResultStatus.FAIL;
// //     }

// //     // Handle publication
// //     const wasPublished = result.isPublished;
// //     if (updateResultDto.isPublished && !wasPublished) {
// //       updateResultDto.publishedAt = new Date();
// //       updateResultDto.publishedBy = publishedBy;
// //     }

// //     Object.assign(result, updateResultDto);
// //     const updatedResult = await this.resultRepository.save(result);

// //     // Send notification if newly published or result changed significantly
// //     if (updateResultDto.isPublished && !wasPublished) {
// //       await this.sendResultNotification(updatedResult, 'RESULT_PUBLISHED');
// //     } else if (
// //       wasPublished &&
// //       (updateResultDto.resultStatus || updateResultDto.percentage)
// //     ) {
// //       await this.sendResultNotification(updatedResult, 'RESULT_UPDATED');
// //     }

// //     this.logger.log(`Result updated successfully with ID: ${id}`);
// //     return updatedResult;
// //   }

// //   async publish(id: string, publishedBy: string): Promise<Result> {
// //     this.logger.debug(`Publishing result with ID: ${id}`);

// //     const result = await this.findOne(id);

// //     if (result.isPublished) {
// //       throw new BadRequestException('Result is already published');
// //     }

// //     result.isPublished = true;
// //     result.publishedAt = new Date();
// //     result.publishedBy = publishedBy;

// //     const publishedResult = await this.resultRepository.save(result);

// //     // Send notification
// //     await this.sendResultNotification(publishedResult, 'RESULT_PUBLISHED');

// //     this.logger.log(`Result published successfully with ID: ${id}`);
// //     return publishedResult;
// //   }

// //   async unpublish(id: string): Promise<Result> {
// //     this.logger.debug(`Unpublishing result with ID: ${id}`);

// //     const result = await this.findOne(id);

// //     if (!result.isPublished) {
// //       throw new BadRequestException('Result is not published');
// //     }

// //     result.isPublished = false;
// //     result.publishedAt = null;
// //     result.publishedBy = null;

// //     const unpublishedResult = await this.resultRepository.save(result);

// //     this.logger.log(`Result unpublished successfully with ID: ${id}`);
// //     return unpublishedResult;
// //   }

// //   async remove(id: string): Promise<void> {
// //     this.logger.debug(`Removing result with ID: ${id}`);

// //     const result = await this.findOne(id);
// //     await this.resultRepository.remove(result);

// //     this.logger.log(`Result removed successfully with ID: ${id}`);
// //   }

// //   async getStatistics(boardType?: string, academicYear?: string) {
// //     this.logger.debug('Generating result statistics');

// //     const queryBuilder = this.resultRepository.createQueryBuilder('result');

// //     if (boardType) {
// //       queryBuilder.andWhere('result.boardType = :boardType', { boardType });
// //     }

// //     if (academicYear) {
// //       queryBuilder.andWhere('result.academicYear = :academicYear', {
// //         academicYear,
// //       });
// //     }

// //     const [
// //       totalResults,
// //       publishedResults,
// //       passResults,
// //       failResults,
// //       pendingResults,
// //     ] = await Promise.all([
// //       queryBuilder.getCount(),
// //       queryBuilder.clone().andWhere('result.isPublished = true').getCount(),
// //       queryBuilder
// //         .clone()
// //         .andWhere('result.resultStatus = :status', {
// //           status: ResultStatus.PASS,
// //         })
// //         .getCount(),
// //       queryBuilder
// //         .clone()
// //         .andWhere('result.resultStatus = :status', {
// //           status: ResultStatus.FAIL,
// //         })
// //         .getCount(),
// //       queryBuilder
// //         .clone()
// //         .andWhere('result.resultStatus = :status', {
// //           status: ResultStatus.PENDING,
// //         })
// //         .getCount(),
// //     ]);

// //     const passPercentage =
// //       totalResults > 0 ? ((passResults / totalResults) * 100).toFixed(2) : '0';

// //     return {
// //       totalResults,
// //       publishedResults,
// //       unpublishedResults: totalResults - publishedResults,
// //       passResults,
// //       failResults,
// //       pendingResults,
// //       passPercentage: parseFloat(passPercentage),
// //     };
// //   }

// //   private async sendResultNotification(
// //     result: Result,
// //     type: string,
// //   ): Promise<void> {
// //     try {
// //       await this.notificationProducer.publishResultNotification({
// //         studentId: result.studentId,
// //         resultId: result.id,
// //         type,
// //         boardType: result.boardType,
// //         classGrade: result.classGrade,
// //         resultStatus: result.resultStatus,
// //         rollNumber: result.rollNumber,
// //       });
// //     } catch (error) {
// //       this.logger.error(
// //         `Failed to send notification for result ${result.id}:`,
// //         error.message,
// //       );
// //     }
// //   }
// // }
