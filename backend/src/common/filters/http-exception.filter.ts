import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP Exception Filter
 * 
 * SECURITY FEATURES:
 * 1. Prevents sensitive information disclosure in error responses
 * 2. Sanitizes error messages in production
 * 3. Logs detailed errors for debugging while hiding from clients
 * 4. Prevents stack trace exposure
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isProduction = process.env.NODE_ENV === 'production';

    // Get error message safely
    let message = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || message;
      
      // Include validation errors only in non-production
      if (!isProduction && typeof exceptionResponse === 'object') {
        errorDetails = exceptionResponse;
      }
    }

    // Log detailed error for debugging
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
      {
        path: request.url,
        method: request.method,
        statusCode: status,
        timestamp: new Date().toISOString(),
        ip: request.ip,
        userAgent: request.get('user-agent'),
      },
    );

    // Response payload - sanitized for production
    const errorResponse = {
      statusCode: status,
      message: isProduction && status === 500 
        ? 'Internal server error' // Generic message in production
        : message,
      ...(errorDetails && !isProduction && { details: errorDetails }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
