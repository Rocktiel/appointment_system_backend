import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword, MAX_LENGTH, MaxLength, Min, MinLength } from 'class-validator';

import { getValidationMessage, DtoField, ValidationMessage } from 'src/_common/enums/ValidationMessages.enum';

export class LoginRequestDto {
  @ApiProperty()
     @IsEmail({}, { message: getValidationMessage(DtoField.EMAIL, ValidationMessage.IS_EMAIL) })
     @MinLength(11, { message: getValidationMessage(DtoField.EMAIL, ValidationMessage.MIN_LENGTH, { value: 11 }) })
     @MaxLength(50, { message: getValidationMessage(DtoField.EMAIL, ValidationMessage.MAX_LENGTH, { value: 50 }) })
     @IsNotEmpty({ message: getValidationMessage(DtoField.EMAIL, ValidationMessage.IS_NOT_EMPTY) })
  email: string;

  @ApiProperty()
  @MinLength(6, { message: getValidationMessage(DtoField.PASSWORD, ValidationMessage.MIN_LENGTH, { value: 6 }) })
  @MaxLength(50, { message: getValidationMessage(DtoField.PASSWORD, ValidationMessage.MAX_LENGTH, { value: 50 }) })
  @IsNotEmpty({ message: getValidationMessage(DtoField.PASSWORD, ValidationMessage.IS_NOT_EMPTY) })
  password: string;
}
