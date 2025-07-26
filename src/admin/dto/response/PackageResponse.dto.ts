import { BaseResponse } from 'src/_base/response/base.response';
import { PackageResponse } from 'src/_common/response/Package.response';

export class PackageResponseDto extends BaseResponse<PackageResponse> {
  declare data: PackageResponse | null;
}
export class PackageListResponseDto extends BaseResponse<PackageResponse[]> {
  declare data: PackageResponse[] | null;
}
