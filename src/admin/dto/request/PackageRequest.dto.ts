import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

import {
  getValidationMessage,
  DtoField,
  ValidationMessage,
} from 'src/_common/enums/ValidationMessages.enum';
export class PackageRequestDto {
  @ApiProperty({ example: 'Premium Plan' })
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.BUSINESS_NAME,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  name: string;

  @ApiProperty({ example: 49.99 })
  @Min(0, {
    message: getValidationMessage(
      DtoField.MAX_BUSINESSES,
      ValidationMessage.MIN_LENGTH,
      { value: 0 },
    ),
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    {
      message: getValidationMessage(
        DtoField.PRICE,
        ValidationMessage.MUST_BE_NUMBER,
      ),
    },
  )
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.PRICE,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  price: number;

  @ApiProperty({ example: '10 işletmeye kadar kullanım hakkı' })
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.DESCRIPTION,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  description: string;

  @ApiProperty({ example: 10 })
  @Min(1, {
    message: getValidationMessage(
      DtoField.MAX_BUSINESSES,
      ValidationMessage.MIN_LENGTH,
      { value: 1 },
    ),
  })
  @IsInt({
    message: getValidationMessage(
      DtoField.MAX_BUSINESSES,
      ValidationMessage.MUST_BE_NUMBER,
    ),
  })
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.MAX_BUSINESSES,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  maxBusinesses: number;
}
