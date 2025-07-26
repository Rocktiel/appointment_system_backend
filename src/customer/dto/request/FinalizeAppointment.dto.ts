import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateAppointmentDto } from './CreateAppointment.dto';

export class FinalizeAppointmentDto extends CreateAppointmentDto {
  @IsNotEmpty()
  @IsNumber()
  bookingId: number;
}
