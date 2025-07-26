import { BaseResponse } from 'src/_base/response/base.response';

import { UserResponse } from 'src/_common/response/User.response';

export class RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export class RegisterResponseDto extends BaseResponse<RegisterResponse> {
  declare data: RegisterResponse | null;
}
