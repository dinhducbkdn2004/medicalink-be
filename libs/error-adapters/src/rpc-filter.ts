import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { toRpcException } from './rpc';

@Catch()
export class RpcDomainErrorFilter implements ExceptionFilter<unknown> {
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'rpc') {
      throw exception;
    }
    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }
    return throwError(() => toRpcException(exception));
  }
}
