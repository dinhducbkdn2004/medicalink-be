export * from './serialization';

export type ErrorDetails = unknown;

// Define a reusable options type for DomainError and subclasses
export type DomainErrorOptions = {
  details?: ErrorDetails;
  cause?: unknown;
  statusCode?: number;
  name?: string;
};

export class DomainError extends Error {
  public readonly details?: ErrorDetails;
  public readonly statusCode?: number;
  public readonly name: string;

  constructor(message: string, opts?: DomainErrorOptions) {
    super(message);
    this.details = opts?.details;
    this.statusCode = opts?.statusCode;
    this.name = opts?.name ?? new.target.name;
    if (opts?.cause) (this as any).cause = opts.cause;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ValidationError extends DomainError {
  constructor(details: string[] | any) {
    super('Validation failed', {
      details,
      statusCode: 400,
      name: 'Bad Request',
    });
  }
}

// 4xx Client Errors
export class BadRequestError extends DomainError {
  constructor(message = 'Bad Request', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 400,
      name: opts?.name ?? 'Bad Request',
    });
  }
}
export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 401,
      name: opts?.name ?? 'Unauthorized',
    });
  }
}
export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 403,
      name: opts?.name ?? 'Forbidden',
    });
  }
}
export class NotFoundError extends DomainError {
  constructor(message = 'Not Found', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 404,
      name: opts?.name ?? 'Not Found',
    });
  }
}
export class MethodNotAllowedError extends DomainError {
  constructor(message = 'Method Not Allowed', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 405,
      name: opts?.name ?? 'Method Not Allowed',
    });
  }
}
export class NotAcceptableError extends DomainError {
  constructor(message = 'Not Acceptable', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 406,
      name: opts?.name ?? 'Not Acceptable',
    });
  }
}
export class RequestTimeoutError extends DomainError {
  constructor(message = 'Request Timeout', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 408,
      name: opts?.name ?? 'Request Timeout',
    });
  }
}
export class ConflictError extends DomainError {
  constructor(message = 'Conflict', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 409,
      name: opts?.name ?? 'Conflict',
    });
  }
}
export class GoneError extends DomainError {
  constructor(message = 'Gone', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 410,
      name: opts?.name ?? 'Gone',
    });
  }
}
export class LengthRequiredError extends DomainError {
  constructor(message = 'Length Required', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 411,
      name: opts?.name ?? 'Length Required',
    });
  }
}
export class PreconditionFailedError extends DomainError {
  constructor(message = 'Precondition Failed', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 412,
      name: opts?.name ?? 'Precondition Failed',
    });
  }
}
export class PayloadTooLargeError extends DomainError {
  constructor(message = 'Payload Too Large', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 413,
      name: opts?.name ?? 'Payload Too Large',
    });
  }
}
export class URITooLongError extends DomainError {
  constructor(message = 'URI Too Long', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 414,
      name: opts?.name ?? 'URI Too Long',
    });
  }
}
export class UnsupportedMediaTypeError extends DomainError {
  constructor(message = 'Unsupported Media Type', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 415,
      name: opts?.name ?? 'Unsupported Media Type',
    });
  }
}
export class RangeNotSatisfiableError extends DomainError {
  constructor(message = 'Range Not Satisfiable', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 416,
      name: opts?.name ?? 'Range Not Satisfiable',
    });
  }
}
export class ExpectationFailedError extends DomainError {
  constructor(message = 'Expectation Failed', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 417,
      name: opts?.name ?? 'Expectation Failed',
    });
  }
}
export class ImATeapotError extends DomainError {
  constructor(message = "I'm a teapot", opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 418,
      name: opts?.name ?? "I'm a teapot",
    });
  }
}
export class UnprocessableEntityError extends DomainError {
  constructor(message = 'Unprocessable Entity', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 422,
      name: opts?.name ?? 'Unprocessable Entity',
    });
  }
}
export class TooEarlyError extends DomainError {
  constructor(message = 'Too Early', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 425,
      name: opts?.name ?? 'Too Early',
    });
  }
}
export class UpgradeRequiredError extends DomainError {
  constructor(message = 'Upgrade Required', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 426,
      name: opts?.name ?? 'Upgrade Required',
    });
  }
}
export class PreconditionRequiredError extends DomainError {
  constructor(message = 'Precondition Required', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 428,
      name: opts?.name ?? 'Precondition Required',
    });
  }
}
export class TooManyRequestsError extends DomainError {
  constructor(message = 'Too Many Requests', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 429,
      name: opts?.name ?? 'Too Many Requests',
    });
  }
}
export class RequestHeaderFieldsTooLargeError extends DomainError {
  constructor(
    message = 'Request Header Fields Too Large',
    opts?: DomainErrorOptions,
  ) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 431,
      name: opts?.name ?? 'Request Header Fields Too Large',
    });
  }
}
export class UnavailableForLegalReasonsError extends DomainError {
  constructor(
    message = 'Unavailable For Legal Reasons',
    opts?: DomainErrorOptions,
  ) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 451,
      name: opts?.name ?? 'Unavailable For Legal Reasons',
    });
  }
}

// 5xx Server Errors
export class NotImplementedError extends DomainError {
  constructor(message = 'Not Implemented', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 501,
      name: opts?.name ?? 'Not Implemented',
    });
  }
}
export class BadGatewayError extends DomainError {
  constructor(message = 'Bad Gateway', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 502,
      name: opts?.name ?? 'Bad Gateway',
    });
  }
}
export class InfraUnavailableError extends DomainError {
  constructor(message = 'Service Unavailable', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 503,
      name: opts?.name ?? 'Service Unavailable',
    });
  }
}
export class GatewayTimeoutError extends DomainError {
  constructor(message = 'Gateway Timeout', opts?: DomainErrorOptions) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 504,
      name: opts?.name ?? 'Gateway Timeout',
    });
  }
}
export class HTTPVersionNotSupportedError extends DomainError {
  constructor(
    message = 'HTTP Version Not Supported',
    opts?: DomainErrorOptions,
  ) {
    super(message, {
      ...opts,
      statusCode: opts?.statusCode ?? 505,
      name: opts?.name ?? 'HTTP Version Not Supported',
    });
  }
}

export function isDomainError(e: unknown): e is DomainError {
  return !!(e && typeof e === 'object' && 'name' in e && e instanceof Error);
}

export function fromUnknown(
  err: unknown,
  fallbackMsg = 'Internal error',
): DomainError {
  if (isDomainError(err)) return err;
  if (err instanceof Error) return new DomainError(err.message, { cause: err });
  return new DomainError(fallbackMsg, { details: err });
}

export type PlainDomainError = {
  message: string;
  details?: ErrorDetails;
  statusCode?: number;
  name?: string;
};

export function toPlain(e: DomainError): PlainDomainError {
  return {
    message: e.message,
    ...(e.details !== undefined && { details: e.details }),
    ...(e.statusCode !== undefined && { statusCode: e.statusCode }),
    ...(e.name !== undefined && { name: e.name }),
  };
}
