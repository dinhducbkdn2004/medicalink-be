const optionalBooleanMapper = new Map([
  ['null', undefined],
  ['undefined', undefined],
  ['true', true],
  ['false', false],
]);

export const booleanTransformer = ({ value }) => {
  if (typeof value === 'boolean') return value;
  else if (typeof value === 'string') {
    return optionalBooleanMapper.get(value.toLocaleLowerCase().trim());
  }
  return undefined;
};
