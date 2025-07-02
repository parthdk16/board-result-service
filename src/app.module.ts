// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentModule } from './result/modules/student.module';
import { StreamModule } from './result/modules/stream.module';
import { AcademicYearModule } from './result/modules/academic-year.module';
import { SubjectModule } from './result/modules/subject.module';
import { ClassLevelModule } from './result/modules/class-level.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: configService.get('NODE_ENV') === 'development',
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    StudentModule,
    StreamModule,
    AcademicYearModule,
    SubjectModule,
    ClassLevelModule,
  ],
})
export class AppModule {}

// // app.module.ts
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ResultModule } from './result/result.module';
// import { Result } from './result/entities_old/result.entity';
// import { Subject } from './result/entities_old/subject.entity';
// import { AcademicYearModule } from './result/modules/academic-year.module';
// import { StreamModule } from './result/modules/stream.module';
// import { StudentModule } from './result/modules/student.module';
// import { SubjectModule } from './result/modules/subject.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       useFactory: (configService: ConfigService) => ({
//         type: 'postgres',
//         url: configService.get<string>('DATABASE_URL'),
//         entities: [Result, Subject],
//         synchronize: configService.get<string>('NODE_ENV') !== 'production',
//         logging: configService.get<string>('NODE_ENV') === 'development',
//         ssl:
//           configService.get<string>('NODE_ENV') === 'production'
//             ? {
//                 rejectUnauthorized: false,
//               }
//             : false,
//       }),
//       inject: [ConfigService],
//     }),
//     AcademicYearModule,
//     StreamModule,
//     StudentModule,
//     SubjectModule,
//   ],
// })
// export class AppModule {}
