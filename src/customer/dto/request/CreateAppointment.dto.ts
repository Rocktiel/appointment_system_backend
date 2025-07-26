import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Matches,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsNumber()
  businessId: number;

  @IsNotEmpty()
  @IsNumber()
  serviceId: number; // Müşteri hangi hizmeti seçti?

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Start time must be in HH:MM or HH:MM:SS format',
  })
  start_time: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'End time must be in HH:MM or HH:MM:SS format',
  })
  end_time: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  customerName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(\+90|0)?5[0-9]{9}$/, {
    message: 'Invalid Turkish phone number format',
  })
  customerPhone: string;

  @IsOptional()
  @IsNumber()
  time_slot_template_id?: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}
