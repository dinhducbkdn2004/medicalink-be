import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';

function generateErrors(errors: ValidationError[]) {
  return errors.reduce<Record<string, string[]>>(
    (
      accumulator: Record<string, string[]>,
      currentValue: ValidationError,
    ): Record<string, string[]> => {
      const property: string = currentValue.property;

      if ((currentValue.children?.length ?? 0) > 0) {
        const nestedErrors = generateErrors(currentValue.children ?? []);
        // Flatten nested errors with property path
        Object.keys(nestedErrors).forEach((nestedProperty) => {
          const fullPath = `${property}.${nestedProperty}`;
          accumulator[fullPath] = nestedErrors[nestedProperty];
        });
        return accumulator;
      }

      const constraints: Record<string, string> | undefined =
        currentValue.constraints;

      if (constraints) {
        accumulator[property] = Object.values(constraints);
      }

      return accumulator;
    },
    {},
  );
}

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]) => {
    return new UnprocessableEntityException({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: generateErrors(errors),
    });
  },
};

export default validationOptions;
