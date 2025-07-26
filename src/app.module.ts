import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './_common/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CustomerModule } from './customer/customer.module';
import { BusinessModule } from './business/business.module';
import { LoggerService } from './_common/logger/logger.service';
import { AllExceptionsFilter } from './_common/filters/all-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from './mail/mail.module';
import { TwilioModule } from './sms/twilio.module';

@Module({
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      global: true,
      signOptions: { expiresIn: '4h' }, // Access token süresi
    }),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AdminModule,
    CustomerModule,
    BusinessModule,
    MailModule,
    TwilioModule,
  ],
})
export class AppModule {}
