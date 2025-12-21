import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MicroserviceErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MicroserviceErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;

        const errorObject = error?.err || error;
        // Handle specific error types
        if (
          errorObject.name === 'TimeoutError' ||
          errorObject instanceof RequestTimeoutException
        ) {
          this.logger.warn(
            `Request timeout on ${method} ${url} - Service not responding`,
          );
          return throwError(
            () =>
              new ServiceUnavailableException(
                'Service is temporarily unavailable. Please try again later.',
              ),
          );
        }

        // Handle connection errors
        if (
          errorObject.code === 'ECONNREFUSED' ||
          errorObject.code === 'ENOTFOUND'
        ) {
          this.logger.error(
            `Connection error on ${method} ${url} - Service unreachable or Message broker is down.`,
          );
          return throwError(
            () =>
              new ServiceUnavailableException(
                'Service is currently unavailable. Please try again later.',
              ),
          );
        }

        // Pass through other errors
        return throwError(() => error);
      }),
    );
  }
}
