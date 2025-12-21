import type { DomainError, PlainDomainError } from './index.js';

export function revivePlainError(p: PlainDomainError): DomainError {
  const { name, message, details } = p;
  const err = new (class extends Error {
    code?: string;
    details?: unknown;
  } as any)(message) as DomainError;
  (err as any).name = name || 'DomainError';
  (err as any).details = details;
  return err;
}
