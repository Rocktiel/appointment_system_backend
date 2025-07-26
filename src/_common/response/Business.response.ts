import { ApiProperty } from '@nestjs/swagger';
import { BusinessTypes } from 'src/_common/enums/BusinessTypes.enums';

export class BusinessResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  businessAddress: string;

  @ApiProperty()
  businessPhone: string;

  @ApiProperty()
  businessEmail: string;

  @ApiProperty({ required: false })
  businessWebsite?: string;

  @ApiProperty({ required: false })
  businessDescription?: string;

  @ApiProperty({ required: false })
  businessLogo?: string;

  @ApiProperty({ enum: BusinessTypes })
  businessType: BusinessTypes;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}