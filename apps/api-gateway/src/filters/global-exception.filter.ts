import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  details?: any[];
  requestId?: string;
}

type Normalized = {
  status: number;
  message: string;
  details?: any[];
};

function isError(e: unknown): e is Error {
  return !!(e && typeof e === 'object' && 'name' in e && 'message' in e);
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();

    const n = this.normalize(exception);

    const payload: ErrorResponse = {
      success: false,
      message: n.message,
      statusCode: n.status,
      timestamp: new Date().toISOString(),
      path: (req as any).originalUrl ?? req.url,
      method: req.method,
      ...(n.details && { details: n.details }),
      requestId,
    };

    res.setHeader('X-Request-Id', requestId);
    res.status(n.status).json(payload);
  }

  // -------- helpers --------

  private normalize(exception: unknown): Normalized {
    // Check if it's a serialized RpcException (from microservice)
    if (this.isSerializedRpcException(exception)) {
      const obj = exception as { [k: string]: any };
      const rpcPayload = obj.error; // Extract the actual RPC payload
      const status = this.pickStatus(rpcPayload.statusCode, rpcPayload.status);
      return {
        status,
        message: rpcPayload.message || 'Microservice error',
        details: rpcPayload.details,
      };
    }

    // 1) HttpException (ValidationPipe included)
    if (exception instanceof HttpException) {
      const status =
        exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const resp = exception.getResponse?.();
      if (resp && typeof resp === 'object') {
        const anyResp = resp as Record<string, unknown>;
        const rawMsg = anyResp.message ?? exception.message ?? 'Error';
        const details = Array.isArray(anyResp.message)
          ? anyResp.message
          : (anyResp.details as any[] | undefined);
        return {
          status,
          message: typeof rawMsg === 'string' ? rawMsg : 'Error',
          details,
        };
      }
      return {
        status,
        message:
          typeof resp === 'string' ? resp : (exception.message ?? 'Error'),
      };
    }

    // 2) RpcException
    if (exception instanceof RpcException) {
      const raw = exception.getError();

      if (raw && typeof raw === 'object') {
        const base =
          (raw as any).response && typeof (raw as any).response === 'object'
            ? (raw as any).response
            : (raw as Record<string, unknown>);

        const status = this.pickStatus(base.statusCode, base.status);

        const message =
          typeof base.message === 'string'
            ? (base.message as string)
            : 'Microservice error';
        const details = base.details as any[] | undefined;
        return { status, message, details };
      }
      const msg = typeof raw === 'string' ? raw : 'RPC Exception';
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: msg,
      };
    }

    // 3) Generic Error
    if (isError(exception)) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
      };
    }

    // 4) Plain object with status/message
    if (exception && typeof exception === 'object') {
      const e = exception as { [k: string]: unknown };
      const status = this.pickStatus(e.statusCode, e.status);
      const message =
        typeof e.message === 'string' ? e.message : 'Internal server error';
      const details = e.details as any[] | undefined;
      return {
        status,
        message,
        details,
      };
    }

    // 5) Fallback
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private pickStatus(statusCode?: unknown, status?: unknown): number {
    const fromStatusCode = this.toHttpStatus(statusCode);
    if (fromStatusCode) {
      return fromStatusCode;
    }

    const fromStatus = this.toHttpStatus(status);
    if (fromStatus) {
      return fromStatus;
    }

    if (
      typeof status === 'string' &&
      (status === 'ECONNREFUSED' || status === 'ETIMEDOUT')
    ) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private toHttpStatus(v: unknown): number | undefined {
    if (typeof v === 'number' && Number.isInteger(v) && v >= 100 && v <= 599) {
      return v;
    }
    return undefined;
  }

  private isSerializedRpcException(exception: unknown): boolean {
    if (!exception || typeof exception !== 'object') {
      return false;
    }

    const obj = exception as any;
    return (
      obj.error &&
      typeof obj.error === 'object' &&
      typeof obj.error.statusCode === 'number' &&
      typeof obj.error.message === 'string' &&
      obj.error.statusCode >= 100 &&
      obj.error.statusCode <= 599
    );
  }
}
