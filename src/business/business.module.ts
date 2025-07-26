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
  ],
})
export class BusinessModule {}
