import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class GetDetailedSlotsParamsDto {
  @IsNotEmpty()
  @IsString()
  businessId: string;
}

export class GetDetailedSlotsQueryDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date: string;
}
