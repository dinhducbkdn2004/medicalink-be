import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class RabbitMQInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RabbitMQInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const pattern = this.extractPattern(context);

    const startTime = Date.now();

    this.logger.debug(
      `[${pattern}] ${className}.${methodName} - Processing message`,
    );

    return next.handle().pipe(
      tap((_data) => {
        const duration = Date.now() - startTime;
        this.logger.debug(
          `[${pattern}] ${className}.${methodName} - Completed in ${duration}ms`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `[${pattern}] ${className}.${methodName} - Failed in ${duration}ms: ${error.message}`,
        );

        // Log error details for debugging
        if (error.stack) {
          this.logger.debug(`[${pattern}] Error stack: ${error.stack}`);
        }

        return throwError(() => error);
      }),
    );
  }

  private extractPattern(context: ExecutionContext): string {
    const handler = context.getHandler();
    const pattern = Reflect.getMetadata('pattern', handler);
    return pattern || 'unknown';
  }
}

@Injectable()
export class RabbitMQErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RabbitMQErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        this.logger.error(`RabbitMQ Error: ${error.message}`, error.stack);

        // Handle specific RabbitMQ errors
        if (error.message?.includes('Connection')) {
          this.logger.error('RabbitMQ connection error - service may be down');
        } else if (error.message?.includes('Channel')) {
          this.logger.error('RabbitMQ channel error - connection may be lost');
        } else if (error.message?.includes('Queue')) {
          this.logger.error('RabbitMQ queue error - queue may not exist');
        } else if (error.message?.includes('Exchange')) {
          this.logger.error('RabbitMQ exchange error - exchange may not exist');
        }

        return throwError(() => error);
      }),
    );
  }
}

@Injectable()
export class RabbitMQRetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RabbitMQRetryInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const retryConfig = Reflect.getMetadata('rabbitmq:retry', handler);

    if (!retryConfig) {
      return next.handle();
    }

    const { maxRetries, delay } = retryConfig;
    let retryCount = 0;

    const executeWithRetry = (): Observable<any> => {
      return next.handle().pipe(
        catchError((error) => {
          retryCount++;

          if (retryCount <= maxRetries) {
            this.logger.warn(
              `Retry ${retryCount}/${maxRetries} for ${context.getClass().name}.${context.getHandler().name}`,
            );

            // Wait before retry
            return new Observable((observer) => {
              setTimeout(() => {
                executeWithRetry().subscribe(observer);
              }, delay * retryCount);
            });
          } else {
            this.logger.error(
              `Max retries (${maxRetries}) exceeded for ${context.getClass().name}.${context.getHandler().name}`,
            );
            return throwError(() => error);
          }
        }),
      );
    };

    return executeWithRetry();
  }
}
