import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class SubscribePackageDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  packageId: number;
}