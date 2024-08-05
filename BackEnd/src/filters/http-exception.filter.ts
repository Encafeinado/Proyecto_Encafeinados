import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    console.log('Error response:', exceptionResponse); // Agrega un log para verificar

    response.status(status).json({
      statusCode: status,
      path: request.url,
      message: (exceptionResponse as any).message || 'Internal server error',
    });
  }
}

