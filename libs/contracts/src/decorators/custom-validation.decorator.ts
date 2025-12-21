import { registerDecorator, ValidationOptions } from 'class-validator';

// Validate classic Prisma/PostgreSQL CUID: 25-char lowercase alphanumeric string starting with 'c'
const CUID_REGEX = /^c[a-z0-9]{24}$/;

/**
 * Class-validator decorator to validate Prisma/PostgreSQL CUID strings.
 */
export function IsCuid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsCuid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && CUID_REGEX.test(value.trim());
        },
        defaultMessage(): string {
          return 'Value must be a valid CUID';
        },
      },
    });
  };
}
