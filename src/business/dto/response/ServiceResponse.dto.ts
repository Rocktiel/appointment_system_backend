import { Expose } from 'class-transformer';

export class ServiceResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose({ name: 'duration_minutes' })
  durationMinutes: number;
}
