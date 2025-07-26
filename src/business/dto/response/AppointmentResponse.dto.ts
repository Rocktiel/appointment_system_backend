import { Expose, Type } from 'class-transformer';
import { ServiceResponseDto } from './ServiceResponse.dto';

export class AppointmentResponseDto {
  @Expose()
  date: string;

  @Expose({ name: 'customer_name' })
  customerName: string;

  @Expose({ name: 'customer_phone' })
  customerPhone: string;

  @Expose()
  note: string;

  @Expose({ name: 'time_slot_template_id' }) // Eğer DB'deki kolon ismi farklıysa
  timeSlotTemplateId: number;

  @Expose()
  @Type(() => ServiceResponseDto) // Class-transformer'a iç içe geçmiş objenin tipini belirtir
  service: ServiceResponseDto;
  @Expose()
  start_time: string;

  @Expose()
  end_time: string;

  @Expose()
  day_id: number;

  @Expose()
  status: string;
}
