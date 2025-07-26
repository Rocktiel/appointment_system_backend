import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS')?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true, // Bu aktifse sadece ilk hatayı gösterir
    }),
  );

  //swagger güvenliğin ayarlanması
  app.use(
    '/docs',
    basicAuth({
      users: { admin: configService.get('SWAGGER_PASSWORD') || '1234' },
      challenge: true,
    }),
  );

  //swagger
  const config = new DocumentBuilder()
    .setTitle('Appointment System')
    .setDescription('The Appointment System API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    customSiteTitle: 'Appointment System',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
