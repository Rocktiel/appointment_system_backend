import { BaseResponse } from 'src/_base/response/base.response';

export class BaseErrorResponse extends BaseResponse<null> {
  readonly statusCode: number;
  readonly timestamp: string;
  readonly path: string;
  readonly method: string;

  constructor(init: {
    message: string;
    statusCode: number;
    path: string;
    method: string;
  }) {
    super(null, false, init.message);
    this.statusCode = init.statusCode;
    this.timestamp = new Date().toISOString();
    this.path = init.path;
    this.method = init.method;
  }
}
