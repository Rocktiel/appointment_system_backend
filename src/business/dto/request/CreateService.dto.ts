import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateServiceDto {
  @IsString({ message: 'Hizmet adı bir metin olmalıdır.' })
  @IsNotEmpty({ message: 'Hizmet adı boş bırakılamaz.' })
  name: string;

  @IsNumber({}, { message: 'Fiyat geçerli bir sayı olmalıdır.' })
  @IsNotEmpty({ message: 'Fiyat boş bırakılamaz.' })
  @Min(0, { message: 'Fiyat negatif olamaz.' })
  price: number;

  @IsNumber({}, { message: 'Süre geçerli bir sayı olmalıdır.' })
  @IsNotEmpty({ message: 'Süre boş bırakılamaz.' })
  @Min(1, { message: 'Hizmet süresi en az 1 dakika olmalıdır.' })
  @Max(1440, { message: 'Hizmet süresi 24 saati (1440 dakika) geçemez.' }) // 24 saat
  duration_minutes: number;
}
