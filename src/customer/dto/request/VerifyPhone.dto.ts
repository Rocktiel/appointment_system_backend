import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class VerifyPhoneDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^(\+90|0)?5[0-9]{9}$/, {
    message: 'Invalid Turkish phone number format',
  })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Verification code must be 6 digits' })
  @Matches(/^\d+$/, { message: 'Verification code must contain only digits' })
  code: string;
}
