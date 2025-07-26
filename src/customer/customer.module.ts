import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Appointment,
  Business,
  Day,
  TimeSlot,
  User,
} from 'src/_common/typeorm';
import { TwilioModule } from 'src/sms/twilio.module';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
  imports: [
    TypeOrmModule.forFeature([Business, Appointment, Day, TimeSlot, User]),
    TwilioModule,
  ],
})
export class CustomerModule {}
