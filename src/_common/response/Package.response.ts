import { ApiProperty } from '@nestjs/swagger';

export class PackageResponse {
  @ApiProperty()
  id: number;
  @ApiProperty()
  price: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  maxBusinesses: number;



}
