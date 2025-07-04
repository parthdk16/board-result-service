import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/intercepters/response.intercepter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    logger.debug('Nest app created');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    const config = new DocumentBuilder()
      .setTitle('Result Service API')
      .setDescription('Board Result Publication System - Result Management')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Results')
      .addTag('Health')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    const port = process.env.PORT || 3002;
    await app.listen(port);

    logger.log(
      `🚀 Result Microservice is running on: http://localhost:${port}/api/v1`,
    );
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  } catch (err) {
    logger.error('🔥 Error during server startup', err);
    process.exit(1);
  }
}

bootstrap();

// // main.ts
// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe, Logger } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { AppModule } from './app.module';
// import { HttpExceptionFilter } from './common/filters/http-exception.filter';
// import { ResponseInterceptor } from './common/intercepters/response.intercepter';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const logger = new Logger('Bootstrap');

//   // Global validation pipe
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//       transformOptions: {
//         enableImplicitConversion: true,
//       },
//     }),
//   );

//   // Global filters and interceptors
//   app.useGlobalFilters(new HttpExceptionFilter());
//   app.useGlobalInterceptors(new ResponseInterceptor());

//   // Enable CORS
//   app.enableCors({
//     origin: process.env.FRONTEND_URL || '*',
//     credentials: true,
//   });

//   // Global prefix
//   app.setGlobalPrefix('api/v1');

//   // Swagger documentation
//   const config = new DocumentBuilder()
//     .setTitle('Result Service API')
//     .setDescription('Board Result Publication System - Result Management')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .addTag('Results')
//     .addTag('Health')
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document, {
//     swaggerOptions: {
//       persistAuthorization: true,
//     },
//   });

//   const port = process.env.PORT || 3002;
//   await app.listen(port);
//   logger.log(
//     `🚀 Result Microservice is running on: http://localhost:${port}/v1`,
//   );
//   logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
// }
// bootstrap();
