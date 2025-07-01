// result.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { QueryResultDto } from './dto/query-result.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Result } from './entities/result.entity';

@ApiTags('Results')
@ApiBearerAuth()
@Controller('results')
@UseGuards(JwtAuthGuard)
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Create a new result' })
  @ApiResponse({
    status: 201,
    description: 'Result created successfully',
    type: Result,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Result already exists' })
  async create(
    @Body() createResultDto: CreateResultDto,
    @Request() req: any,
  ): Promise<Result> {
    return this.resultService.create(createResultDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all results with filters' })
  @ApiResponse({ status: 200, description: 'Results retrieved successfully' })
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: 'Filter by student ID',
  })
  @ApiQuery({
    name: 'boardType',
    required: false,
    enum: ['CBSE'], // Only CBSE is allowed
  })
  @ApiQuery({
    name: 'classGrade',
    required: false,
    enum: ['10', '12'], // Only GRADE 10 and 12 are allowed
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Filter by academic year',
  })
  @ApiQuery({
    name: 'rollNumber',
    required: false,
    description: 'Filter by roll number',
  })
  @ApiQuery({
    name: 'resultStatus',
    required: false,
    enum: ['PASS', 'FAIL', 'ABSENT', 'PENDING'],
  })
  @ApiQuery({ name: 'isPublished', required: false, type: 'boolean' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Items per page (default: 10)',
  })
  async findAll(@Query() queryDto: QueryResultDto) {
    return this.resultService.findAll(queryDto);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get all results for a specific student' })
  @ApiResponse({
    status: 200,
    description: 'Student results retrieved successfully',
    type: [Result],
  })
  async findByStudent(
    @Param('studentId') studentId: string,
  ): Promise<Result[]> {
    return this.resultService.findByStudent(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific result by ID' })
  @ApiResponse({
    status: 200,
    description: 'Result retrieved successfully',
    type: Result,
  })
  @ApiResponse({ status: 404, description: 'Result not found' })
  async findOne(@Param('id') id: string): Promise<Result> {
    return this.resultService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Update a result' })
  @ApiResponse({
    status: 200,
    description: 'Result updated successfully',
    type: Result,
  })
  @ApiResponse({ status: 404, description: 'Result not found' })
  async update(
    @Param('id') id: string,
    @Body() updateResultDto: UpdateResultDto,
    @Request() req: any,
  ): Promise<Result> {
    return this.resultService.update(id, updateResultDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a result' })
  @ApiResponse({ status: 204, description: 'Result deleted successfully' })
  @ApiResponse({ status: 404, description: 'Result not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.resultService.remove(id);
  }
}

// // src/result/result.controller.ts
// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Query,
//   UseGuards,
//   Request,
//   HttpCode,
//   HttpStatus,
// } from '@nestjs/common';
// import {
//   ApiTags,
//   ApiOperation,
//   ApiResponse,
//   ApiBearerAuth,
//   ApiQuery,
// } from '@nestjs/swagger';
// import { ResultService } from './result.service';
// import { CreateResultDto } from './dto/create-result.dto';
// import { UpdateResultDto } from './dto/update-result.dto';
// import { QueryResultDto } from './dto/query-result.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
// import { Result } from './entities/result.entity';

// @ApiTags('Results')
// @ApiBearerAuth()
// @Controller('results')
// @UseGuards(JwtAuthGuard)
// export class ResultController {
//   constructor(private readonly resultService: ResultService) {}

//   @Post()
//   @UseGuards(RolesGuard)
//   @Roles('ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Create a new result' })
//   @ApiResponse({
//     status: 201,
//     description: 'Result created successfully',
//     type: Result,
//   })
//   @ApiResponse({ status: 400, description: 'Bad request' })
//   @ApiResponse({ status: 409, description: 'Result already exists' })
//   async create(
//     @Body() createResultDto: CreateResultDto,
//     @Request() req: any,
//   ): Promise<Result> {
//     return this.resultService.create(createResultDto, req.user.id);
//   }

//   @Get()
//   @ApiOperation({ summary: 'Get all results with filters' })
//   @ApiResponse({ status: 200, description: 'Results retrieved successfully' })
//   @ApiQuery({
//     name: 'studentId',
//     required: false,
//     description: 'Filter by student ID',
//   })
//   @ApiQuery({
//     name: 'boardType',
//     required: false,
//     enum: ['CBSE', 'ICSE', 'STATE_BOARD', 'IGCSE', 'IB'],
//   })
//   @ApiQuery({
//     name: 'classGrade',
//     required: false,
//     enum: ['10', '12', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE'],
//   })
//   @ApiQuery({
//     name: 'academicYear',
//     required: false,
//     description: 'Filter by academic year',
//   })
//   @ApiQuery({
//     name: 'rollNumber',
//     required: false,
//     description: 'Filter by roll number',
//   })
//   @ApiQuery({
//     name: 'resultStatus',
//     required: false,
//     enum: ['PASS', 'FAIL', 'ABSENT', 'PENDING'],
//   })
//   @ApiQuery({ name: 'isPublished', required: false, type: 'boolean' })
//   @ApiQuery({
//     name: 'page',
//     required: false,
//     type: 'number',
//     description: 'Page number (default: 1)',
//   })
//   @ApiQuery({
//     name: 'limit',
//     required: false,
//     type: 'number',
//     description: 'Items per page (default: 10)',
//   })
//   async findAll(@Query() queryDto: QueryResultDto) {
//     return this.resultService.findAll(queryDto);
//   }

//   @Get('statistics')
//   @UseGuards(RolesGuard)
//   @Roles('ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Get result statistics' })
//   @ApiResponse({
//     status: 200,
//     description: 'Statistics retrieved successfully',
//   })
//   @ApiQuery({
//     name: 'boardType',
//     required: false,
//     enum: ['CBSE', 'ICSE', 'STATE_BOARD', 'IGCSE', 'IB'],
//   })
//   @ApiQuery({
//     name: 'academicYear',
//     required: false,
//     description: 'Filter by academic year',
//   })
//   async getStatistics(
//     @Query('boardType') boardType?: string,
//     @Query('academicYear') academicYear?: string,
//   ) {
//     return this.resultService.getStatistics(boardType, academicYear);
//   }

//   @Get('student/:studentId')
//   @ApiOperation({ summary: 'Get all results for a specific student' })
//   @ApiResponse({
//     status: 200,
//     description: 'Student results retrieved successfully',
//     type: [Result],
//   })
//   async findByStudent(
//     @Param('studentId') studentId: string,
//   ): Promise<Result[]> {
//     return this.resultService.findByStudent(studentId);
//   }

//   @Get('search/roll-number/:rollNumber')
//   @ApiOperation({ summary: 'Search results by roll number' })
//   @ApiResponse({ status: 200, description: 'Results found', type: [Result] })
//   @ApiQuery({
//     name: 'boardType',
//     required: false,
//     description: 'Filter by board type',
//   })
//   @ApiQuery({
//     name: 'academicYear',
//     required: false,
//     description: 'Filter by academic year',
//   })
//   async findByRollNumber(
//     @Param('rollNumber') rollNumber: string,
//     @Query('boardType') boardType?: string,
//     @Query('academicYear') academicYear?: string,
//   ): Promise<Result[]> {
//     return this.resultService.findByRollNumber(
//       rollNumber,
//       boardType,
//       academicYear,
//     );
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Get a specific result by ID' })
//   @ApiResponse({
//     status: 200,
//     description: 'Result retrieved successfully',
//     type: Result,
//   })
//   @ApiResponse({ status: 404, description: 'Result not found' })
//   async findOne(@Param('id') id: string): Promise<Result> {
//     return this.resultService.findOne(id);
//   }

//   @Patch(':id')
//   @UseGuards(RolesGuard)
//   @Roles('ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Update a result' })
//   @ApiResponse({
//     status: 200,
//     description: 'Result updated successfully',
//     type: Result,
//   })
//   @ApiResponse({ status: 404, description: 'Result not found' })
//   async update(
//     @Param('id') id: string,
//     @Body() updateResultDto: UpdateResultDto,
//     @Request() req: any,
//   ): Promise<Result> {
//     return this.resultService.update(id, updateResultDto, req.user.id);
//   }

//   @Patch(':id/publish')
//   @UseGuards(RolesGuard)
//   @Roles('ADMIN')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Publish a result' })
//   @ApiResponse({
//     status: 200,
//     description: 'Result published successfully',
//     type: Result,
//   })
//   @ApiResponse({ status: 400, description: 'Result already published' })
//   @ApiResponse({ status: 404, description: 'Result not found' })
//   async publish(@Param('id') id: string, @Request() req: any): Promise<Result> {
//     return this.resultService.publish(id, req.user.id);
//   }

//   @Patch(':id/unpublish')
//   @UseGuards(RolesGuard)
//   @Roles('ADMIN')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Unpublish a result' })
//   @ApiResponse({
//     status: 200,
//     description: 'Result unpublished successfully',
//     type: Result,
//   })
//   @ApiResponse({ status: 400, description: 'Result is not published' })
//   @ApiResponse({ status: 404, description: 'Result not found' })
//   async unpublish(@Param('id') id: string): Promise<Result> {
//     return this.resultService.unpublish(id);
//   }

//   @Delete(':id')
//   @UseGuards(RolesGuard)
//   @Roles('ADMIN')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   @ApiOperation({ summary: 'Delete a result' })
//   @ApiResponse({ status: 204, description: 'Result deleted successfully' })
//   @ApiResponse({ status: 404, description: 'Result not found' })
//   async remove(@Param('id') id: string): Promise<void> {
//     return this.resultService.remove(id);
//   }
// }
