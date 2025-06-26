// src/result/result.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result, ResultStatus } from './entities/result.entity';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { QueryResultDto } from './dto/query-result.dto';
import { UserClientService } from '../user-client/user-client.service';
import { NotificationProducer } from '../notification-producer/notification.producer';

@Injectable()
export class ResultService {
  private readonly logger = new Logger(ResultService.name);

  constructor(
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
    private readonly userClientService: UserClientService,
    private readonly notificationProducer: NotificationProducer,
  ) {}

  async create(
    createResultDto: CreateResultDto,
    publishedBy?: string,
  ): Promise<Result> {
    this.logger.debug(
      `Creating result for student: ${createResultDto.studentId}`,
    );

    // Verify student exists
    const studentExists = await this.userClientService.verifyStudent(createResultDto.studentId);
    if (!studentExists) {
      throw new BadRequestException('Student not found in user service');
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
        'Result already exists for this student, board, class, and academic year'
      );
    }

    // Calculate percentage if marks are provided
    if (createResultDto.totalMarks && createResultDto.obtainedMarks) {
      createResultDto.percentage = Number(
        (
          (createResultDto.obtainedMarks / createResultDto.totalMarks) *
          100
        ).toFixed(2),
      );
    }

    // Determine result status if not provided
    if (
      !createResultDto.resultStatus &&
      createResultDto.percentage !== undefined
    ) {
      createResultDto.resultStatus =
        createResultDto.percentage >= 35
          ? ResultStatus.PASS
          : ResultStatus.FAIL;
    }

    const result = this.resultRepository.create({
      ...createResultDto,
      publishedBy: createResultDto.isPublished ? publishedBy : undefined,
      publishedAt: createResultDto.isPublished ? new Date() : undefined,
    });

    const savedResult = await this.resultRepository.save(result);

    // Send notification if published
    if (savedResult.isPublished) {
      await this.sendResultNotification(savedResult, 'RESULT_PUBLISHED');
    }

    this.logger.log(`Result created successfully with ID: ${savedResult.id}`);
    return savedResult;
  }

  async findAll(
    queryDto: QueryResultDto,
  ): Promise<{ results: Result[]; total: number }> {
    this.logger.debug('Fetching results with filters', queryDto);

    const queryBuilder = this.resultRepository.createQueryBuilder('result');

    // Apply filters
    if (queryDto.studentId) {
      queryBuilder.andWhere('result.studentId = :studentId', {
        studentId: queryDto.studentId,
      });
    }

    if (queryDto.boardType) {
      queryBuilder.andWhere('result.boardType = :boardType', {
        boardType: queryDto.boardType,
      });
    }

    if (queryDto.classGrade) {
      queryBuilder.andWhere('result.classGrade = :classGrade', {
        classGrade: queryDto.classGrade,
      });
    }

    if (queryDto.academicYear) {
      queryBuilder.andWhere('result.academicYear = :academicYear', {
        academicYear: queryDto.academicYear,
      });
    }

    if (queryDto.rollNumber) {
      queryBuilder.andWhere('result.rollNumber ILIKE :rollNumber', {
        rollNumber: `%${queryDto.rollNumber}%`,
      });
    }

    if (queryDto.resultStatus) {
      queryBuilder.andWhere('result.resultStatus = :resultStatus', {
        resultStatus: queryDto.resultStatus,
      });
    }

    if (queryDto.isPublished !== undefined) {
      queryBuilder.andWhere('result.isPublished = :isPublished', {
        isPublished: queryDto.isPublished,
      });
    }

    // Pagination
    const offset = (queryDto.page - 1) * queryDto.limit;
    queryBuilder.skip(offset).take(queryDto.limit);

    // Order by creation date (newest first)
    queryBuilder.orderBy('result.createdAt', 'DESC');

    const [results, total] = await queryBuilder.getManyAndCount();

    return { results, total };
  }

  async findOne(id: string): Promise<Result> {
    this.logger.debug(`Fetching result with ID: ${id}`);

    const result = await this.resultRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }

    return result;
  }

  async findByStudent(studentId: string): Promise<Result[]> {
    this.logger.debug(`Fetching results for student: ${studentId}`);

    return this.resultRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByRollNumber(
    rollNumber: string,
    boardType?: string,
    academicYear?: string,
  ): Promise<Result[]> {
    this.logger.debug(`Searching results by roll number: ${rollNumber}`);

    const where: any = { rollNumber };
    if (boardType) where.boardType = boardType;
    if (academicYear) where.academicYear = academicYear;

    return this.resultRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateResultDto: UpdateResultDto,
    publishedBy?: string,
  ): Promise<Result> {
    this.logger.debug(`Updating result with ID: ${id}`);

    const result = await this.findOne(id);

    // Recalculate percentage if marks are updated
    if (updateResultDto.totalMarks || updateResultDto.obtainedMarks) {
      const totalMarks = updateResultDto.totalMarks ?? result.totalMarks;
      const obtainedMarks =
        updateResultDto.obtainedMarks ?? result.obtainedMarks;

      if (totalMarks && obtainedMarks) {
        updateResultDto.percentage = Number(
          ((obtainedMarks / totalMarks) * 100).toFixed(2),
        );
      }
    }

    // Update result status if percentage changed
    if (
      updateResultDto.percentage !== undefined &&
      !updateResultDto.resultStatus
    ) {
      updateResultDto.resultStatus =
        updateResultDto.percentage >= 35
          ? ResultStatus.PASS
          : ResultStatus.FAIL;
    }

    // Handle publication
    const wasPublished = result.isPublished;
    if (updateResultDto.isPublished && !wasPublished) {
      updateResultDto.publishedAt = new Date();
      updateResultDto.publishedBy = publishedBy;
    }

    Object.assign(result, updateResultDto);
    const updatedResult = await this.resultRepository.save(result);

    // Send notification if newly published or result changed significantly
    if (updateResultDto.isPublished && !wasPublished) {
      await this.sendResultNotification(updatedResult, 'RESULT_PUBLISHED');
    } else if (
      wasPublished &&
      (updateResultDto.resultStatus || updateResultDto.percentage)
    ) {
      await this.sendResultNotification(updatedResult, 'RESULT_UPDATED');
    }

    this.logger.log(`Result updated successfully with ID: ${id}`);
    return updatedResult;
  }

  async publish(id: string, publishedBy: string): Promise<Result> {
    this.logger.debug(`Publishing result with ID: ${id}`);

    const result = await this.findOne(id);

    if (result.isPublished) {
      throw new BadRequestException('Result is already published');
    }

    result.isPublished = true;
    result.publishedAt = new Date();
    result.publishedBy = publishedBy;

    const publishedResult = await this.resultRepository.save(result);

    // Send notification
    await this.sendResultNotification(publishedResult, 'RESULT_PUBLISHED');

    this.logger.log(`Result published successfully with ID: ${id}`);
    return publishedResult;
  }

  async unpublish(id: string): Promise<Result> {
    this.logger.debug(`Unpublishing result with ID: ${id}`);

    const result = await this.findOne(id);

    if (!result.isPublished) {
      throw new BadRequestException('Result is not published');
    }

    result.isPublished = false;
    result.publishedAt = null;
    result.publishedBy = null;

    const unpublishedResult = await this.resultRepository.save(result);

    this.logger.log(`Result unpublished successfully with ID: ${id}`);
    return unpublishedResult;
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`Removing result with ID: ${id}`);

    const result = await this.findOne(id);
    await this.resultRepository.remove(result);

    this.logger.log(`Result removed successfully with ID: ${id}`);
  }

  async getStatistics(boardType?: string, academicYear?: string) {
    this.logger.debug('Generating result statistics');

    const queryBuilder = this.resultRepository.createQueryBuilder('result');

    if (boardType) {
      queryBuilder.andWhere('result.boardType = :boardType', { boardType });
    }

    if (academicYear) {
      queryBuilder.andWhere('result.academicYear = :academicYear', {
        academicYear,
      });
    }

    const [
      totalResults,
      publishedResults,
      passResults,
      failResults,
      pendingResults,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('result.isPublished = true').getCount(),
      queryBuilder
        .clone()
        .andWhere('result.resultStatus = :status', {
          status: ResultStatus.PASS,
        })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('result.resultStatus = :status', {
          status: ResultStatus.FAIL,
        })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('result.resultStatus = :status', {
          status: ResultStatus.PENDING,
        })
        .getCount(),
    ]);

    const passPercentage =
      totalResults > 0 ? ((passResults / totalResults) * 100).toFixed(2) : '0';

    return {
      totalResults,
      publishedResults,
      unpublishedResults: totalResults - publishedResults,
      passResults,
      failResults,
      pendingResults,
      passPercentage: parseFloat(passPercentage),
    };
  }

  private async sendResultNotification(
    result: Result,
    type: string,
  ): Promise<void> {
    try {
      await this.notificationProducer.publishResultNotification({
        studentId: result.studentId,
        resultId: result.id,
        type,
        boardType: result.boardType,
        classGrade: result.classGrade,
        resultStatus: result.resultStatus,
        rollNumber: result.rollNumber,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send notification for result ${result.id}:`,
        error.message,
      );
    }
  }
}
