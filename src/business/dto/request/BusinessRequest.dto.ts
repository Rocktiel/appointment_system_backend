import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  IsNumber,
} from 'class-validator';
import { BusinessTypes } from 'src/_common/enums/BusinessTypes.enums';
import {
  DtoField,
  getValidationMessage,
  ValidationMessage,
} from 'src/_common/enums/ValidationMessages.enum';

export class BusinessRequestDto {
  @ApiProperty({ example: 'Güzellik Merkezi A' })
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.BUSINESS_NAME,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  @IsString()
  businessName: string;

  @ApiProperty({ example: 'İstanbul, Kadıköy' })
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.BUSINESS_ADDRESS,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  @IsString()
  businessAddress: string;

  @ApiProperty({ example: '905321112233' })
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.BUSINESS_PHONE,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  @Matches(/^90[0-9]{10}$/, {
    message:
      'Telefon numarası 90 ile başlamalı ve 12 haneli olmalı (örn: 905321112233)',
  })
  businessPhone: string;

  @ApiProperty({ example: 'info@firma.com' })
  @IsNotEmpty({
    message: getValidationMessage(
      DtoField.BUSINESS_EMAIL,
      ValidationMessage.IS_NOT_EMPTY,
    ),
  })
  @IsEmail(
    {},
    {
      message: getValidationMessage(
        DtoField.BUSINESS_EMAIL,
        ValidationMessage.MUST_BE_EMAIL,
      ),
    },
  )
  businessEmail: string;

  @ApiProperty({ example: 'https://www.firma.com', required: false })
  @IsOptional()
  @IsString()
  businessWebsite?: string;

  @ApiProperty({
    example: 'Kalıcı makyaj ve cilt bakımı hizmetleri',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessDescription?: string;

  @ApiProperty({ example: 'https://cdn.firma.com/logo.png', required: false })
  @IsOptional()
  @IsString()
  businessLogo?: string;

  @ApiProperty({ enum: BusinessTypes, example: BusinessTypes.MAKEUP })
  @IsOptional()
  // @IsNotEmpty({
  //   message: getValidationMessage(
  //     DtoField.BUSINESS_TYPE,
  //     ValidationMessage.IS_NOT_EMPTY,
  //   ),
  // })
  @IsEnum(BusinessTypes, { message: 'Geçersiz işletme türü' })
  businessType: BusinessTypes;

  @ApiProperty({ example: 40.88149685366166 })
  @IsOptional()
  // @IsNotEmpty({
  //   message: getValidationMessage(
  //     DtoField.BUSINESS_LATITUDE,
  //     ValidationMessage.IS_NOT_EMPTY,
  //   ),
  // })
  @IsNumber({}, { message: 'Geçerli bir enlem değeri girin' })
  lat: number;

  @ApiProperty({ example: 37.441963616223255 })
  @IsOptional()
  // @IsNotEmpty({
  //   message: getValidationMessage(
  //     DtoField.BUSINESS_LONGITUDE,
  //     ValidationMessage.IS_NOT_EMPTY,
  //   ),
  // })
  @IsNumber({}, { message: 'Geçerli bir boylam değeri girin' })
  lng: number;

  @ApiProperty({ example: 40.88149685366166 })
  @IsOptional()
  // @IsNotEmpty({
  //   message: getValidationMessage(
  //     DtoField.BUSINESS_LONGITUDE,
  //     ValidationMessage.IS_NOT_EMPTY,
  //   ),
  // })
  isPhoneVisible: boolean;

  @ApiProperty({ example: 40.88149685366166 })
  @IsOptional()
  // @IsNotEmpty({
  //   message: getValidationMessage(
  //     DtoField.BUSINESS_LONGITUDE,
  //     ValidationMessage.IS_NOT_EMPTY,
  //   ),
  // })
  isLocationVisible: boolean;

  @ApiProperty({ example: 'İstanbul', required: false })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Ataşehir', required: false })
  @IsOptional()
  @IsString()
  county: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  businessLocationUrl: string;
}
