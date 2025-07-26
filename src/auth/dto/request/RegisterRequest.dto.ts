import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserTypes } from 'src/_common/enums/UserTypes.enums';

import {
  getValidationMessage,
  DtoField,
  ValidationMessage,
} from 'src/_common/enums/ValidationMessages.enum';
export class RegisterRequestDto {
  @ApiProperty()
  @IsEmail(
    {},
    {
      message: getValidationMessage(DtoField.EMAIL, ValidationMessage.IS_EMAIL),
    },
  )
  @MinLength(11, {
    message: getValidationMessage(
      DtoField.EMAIL,
      ValidationMessage.MIN_LENGTH,
      { value: 11 },
    ),
  })
  @MaxLength(50, {
    message: getValidationMessage(
      DtoField.EMAIL,
      ValidationMessage.MAX_LENGTH,
      { value: 50 },
    ),
  })
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.EMAIL,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  email: string;

  @ApiProperty()
  @IsStrongPassword(
    { minSymbols: 0, minUppercase: 0, minNumbers: 0 },
    {
      message: getValidationMessage(
        DtoField.PASSWORD,
        ValidationMessage.IS_STRONG_PASSWORD,
      ),
    },
  )
  @MinLength(6, {
    message: getValidationMessage(
      DtoField.PASSWORD,
      ValidationMessage.MIN_LENGTH,
      { value: 6 },
    ),
  })
  @MaxLength(50, {
    message: getValidationMessage(
      DtoField.PASSWORD,
      ValidationMessage.MAX_LENGTH,
      { value: 50 },
    ),
  })
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.PASSWORD,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  password: string;

  @IsEnum(UserTypes, {
    message: getValidationMessage(
      DtoField.USER_TYPE,
      ValidationMessage.NOT_VALID,
    ),
  })
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.USER_TYPE,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  userType: UserTypes;
}
