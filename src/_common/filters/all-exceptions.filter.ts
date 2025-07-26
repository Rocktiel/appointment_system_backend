import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ValidationError } from 'class-validator';
import { LoggerService } from '../logger/logger.service';
import { BaseErrorResponse } from 'src/_base/response/baseError.response';
import { ResponseMessages } from '../enums/ResponseMessages.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = ResponseMessages.INTERNAL_SERVER_ERROR;

    let errorName: string = 'InternalServerError';
    let stack: string | undefined = undefined;

    // 1. HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      const rawMessage =
        typeof res === 'string'
          ? res
          : Array.isArray((res as any)?.message)
            ? (res as any)?.message[0]
            : (res as any)?.message;

      message =
        typeof rawMessage === 'string' &&
        ResponseMessages[
          rawMessage.toUpperCase() as keyof typeof ResponseMessages
        ]
          ? ResponseMessages[
              rawMessage.toUpperCase() as keyof typeof ResponseMessages
            ]
          : rawMessage;

      errorName = exception.name;
      stack = (exception as any)?.stack;
    }

    // 2. TypeORM hatası (örneğin duplicate key, constraint ihlali)
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = (exception as any).message;
      errorName = 'QueryFailedError';
      stack = (exception as any)?.stack;
    }

    // 3. class-validator doğrulama hataları (DTO hataları)
    else if (
      Array.isArray(exception) &&
      exception[0] instanceof ValidationError
    ) {
      status = HttpStatus.BAD_REQUEST;
      const firstError = exception[0];
      const constraintMessages = Object.values(firstError.constraints || {});
      message = constraintMessages[0] as string;
      errorName = 'ValidationError';
    }

    // 4. Diğer bilinmeyen hatalar
    else {
      stack = (exception as any)?.stack;
      message = (exception as any)?.message || message;
    }

    // BaseErrorResponse ile standart JSON dön
    const errorResponse = new BaseErrorResponse({
      message,
      statusCode: status,
      path: request.url,
      method: request.method,
    });

    // Loglama
    this.logger.error(
      {
        path: request.url,
        method: request.method,
        statusCode: status,
        message,
        errorName,
      },
      stack,
      'AllExceptionsFilter',
    );

    response.status(status).json(errorResponse);
  }
}
