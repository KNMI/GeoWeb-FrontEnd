import hasClass from './hasclass';

describe('(Utils) hasclass', () => {
  it('hasClass should be a function', () => {
    expect(hasClass).to.be.a('function');
  });
  it('hasClass should return false when provided with not-strings', () => {
    let result = hasClass(null, 'test');
    expect(result).to.eql(false);
    result = hasClass('test', null);
    expect(result).to.eql(false);
    result = hasClass(2, 'test');
    expect(result).to.eql(false);
    result = hasClass('test', 2);
    expect(result).to.eql(false);
    result = hasClass('test', true);
    expect(result).to.eql(false);
    result = hasClass(false, 'test');
    expect(result).to.eql(false);
  });
  it('hasClass should return true when class name exists', () => {
    let result = hasClass('test an other class', 'test');
    expect(result).to.eql(true);
    result = hasClass('an other test class', 'test');
    expect(result).to.eql(true);
    result = hasClass('an other class test', 'test');
    expect(result).to.eql(true);
  });
  it('hasClass should return false when class name only exists partially', () => {
    let result = hasClass('an other classtest', 'test');
    expect(result).to.eql(false);
    result = hasClass('an other est class', 'test');
    expect(result).to.eql(false);
  });
});
