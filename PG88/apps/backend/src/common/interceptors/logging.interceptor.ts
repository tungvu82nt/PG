import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>(); // Remove generic type <Request> if strictly typed, but usually fine
    const userAgent = request.get('user-agent') || '';
    const userId = (request as any).user?.userId || 'anonymous';
    const { method, url, ip } = request;

    const now = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const response = ctx.getResponse();
        const statusCode = response.statusCode;
        const delay = Date.now() - now;

        this.logger.log(
          `${method} ${url} ${statusCode} ${delay}ms - User: ${userId} - IP: ${ip} - UA: ${userAgent}`,
        );
      }),
    );
  }
}
