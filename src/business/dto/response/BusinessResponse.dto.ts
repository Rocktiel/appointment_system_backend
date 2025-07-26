import { BaseResponse } from 'src/_base/response/base.response';
import { BusinessResponse } from 'src/_common/response/Business.response';


export class BusinessResponseDto extends BaseResponse<BusinessResponse> {
  declare data: BusinessResponse | null;
}
