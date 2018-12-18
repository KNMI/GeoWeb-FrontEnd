import { validate, complement } from './json';

describe('tmp-json', () => {
  it('.validate should be a function', () => {
    expect(validate).to.be.a('function');
  });
  it('.validate should return default when no result object provided', () => {
    const defaultResult = {
      isValid: false,
      matchedKey: null
    };
    let result = validate();
    expect(result).to.eql(defaultResult);
  });
  it('.complement should be a function', () => {
    expect(complement).to.be.a('function');
  });
  it('.complement should return default when no result object provided', () => {
    const defaultResult = {
      isComplemented: false,
      structure: null
    };
    let result = complement();
    expect(result).to.eql(defaultResult);
  });
});
