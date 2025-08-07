import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/_base/response/base.response';

import { UserResponse } from 'src/_common/response/User.response';

export class LoginResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserResponse })
  user: UserResponse;
}

export class LoginResponseDto extends BaseResponse<LoginResponse> {
  @ApiProperty({ type: LoginResponse })
  declare data: LoginResponse | null;
}
