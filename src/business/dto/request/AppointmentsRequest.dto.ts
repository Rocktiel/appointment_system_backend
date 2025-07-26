import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AppointmentsRequestDto {
  @IsNotEmpty()
  @Type(() => Number)
  businessId: number;

  @IsNotEmpty()
  @IsString()
  date: string;

  @IsOptional()
  time_slot_template_id: number;
}
