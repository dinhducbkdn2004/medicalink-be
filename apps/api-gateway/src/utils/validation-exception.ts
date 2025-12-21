import { BadRequestException } from '@nestjs/common';
import { ValidationError as ClassValidatorError } from 'class-validator';

export class ValidationException extends BadRequestException {
  constructor(public validationErrors: ClassValidatorError[]) {
    const message = ValidationException.createErrorMessage(validationErrors);
    super({
      message: message ?? 'Validation failed',
      error: 'Bad Request',
      statusCode: 400,
      details: ValidationException.formatErrors(validationErrors),
    });
  }

  private static createErrorMessage(errors: ClassValidatorError[]): string {
    return `Validation failed on ${errors.length} field(s)`;
  }

  private static formatErrors(errors: ClassValidatorError[]): any[] {
    return errors.map((error) => ({
      property: error.property,
      value: error.value,
      constraints: error.constraints || {},
      children: error.children?.length
        ? ValidationException.formatErrors(error.children)
        : undefined,
    }));
  }
}

export interface ValidationErrorDetail {
  property: string;
  value: any;
  constraints: Record<string, string>;
  children?: ValidationErrorDetail[];
}
