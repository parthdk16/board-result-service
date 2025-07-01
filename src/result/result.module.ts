// result.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ResultController } from './result.controller';
import { ResultService } from './result.service';
import { Result } from './entities/result.entity';
import { UserServiceClient } from '../user-client/user-service.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Result]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [ResultController],
  providers: [ResultService, UserServiceClient],
  exports: [ResultService, UserServiceClient],
})
export class ResultModule {}

// // result.module.ts
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { HttpModule } from '@nestjs/axios';
// import { ConfigModule } from '@nestjs/config';
// import { ResultController } from './result.controller';
// import { ResultService } from './result.service';
// import { UserServiceClient } from './clients/user-service.client';
// import { Result } from './entities/result.entity';
// import { Subject } from './entities/subject.entity';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import { RolesGuard } from './guards/roles.guard';

// @Module({
//   imports: [
//     ConfigModule.forRoot(),
//     TypeOrmModule.forFeature([Result, Subject]),
//     HttpModule.register({
//       timeout: 5000,
//       maxRedirects: 5,
//     }),
//   ],
//   controllers: [ResultController],
//   providers: [
//     ResultService,
//     UserServiceClient,
//     JwtAuthGuard,
//     RolesGuard,
//   ],
//   exports: [ResultService, UserServiceClient],
// })
// export class ResultModule {}
