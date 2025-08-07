import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Appointment,
  Business,
  Day,
  Service,
  SubscriptionPlan,
  TimeSlot,
  User,
} from 'src/_common/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [BusinessController],
  providers: [BusinessService],
  imports: [
    TypeOrmModule.forFeature([
      TimeSlot,
      Business,
      Day,
      User,
      SubscriptionPlan,
      Service,
      Appointment,
    ]),
    AuthModule, // AuthModule'ü ekleyerek JWT ve kimlik doğrulama işlevselliğini kullanabiliriz
  ],
})
export class BusinessModule {}
