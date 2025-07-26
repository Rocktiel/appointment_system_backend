// src/auth/dto/request/ConfirmEmailRequest.dto.ts
import { IsEmail, IsString, Length } from 'class-validator';

export class ConfirmEmailDto {
  @IsEmail({}, { message: 'Geçersiz email formatı.' })
  email: string;

  @IsString({ message: 'Doğrulama kodu metin olmalıdır.' })
  @Length(6, 6, { message: 'Doğrulama kodu 6 haneli olmalıdır.' })
  confirmCode: string;
}
