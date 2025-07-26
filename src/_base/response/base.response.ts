import { ResponseMessages } from 'src/_common/enums/ResponseMessages.enum';

export class BaseResponse<T> {
  readonly data: T | null;
  readonly success: boolean;
  readonly message: ResponseMessages | string;

  constructor(
    data: T | null,
    success: boolean,
    message: ResponseMessages | string = ResponseMessages.SUCCESS,
  ) {
    this.data = data;
    this.success = success;
    this.message = message;
  }
}
