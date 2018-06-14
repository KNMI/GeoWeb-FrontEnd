import dispatch from './SigmetReducers';

describe('(Reducer) SigmetReducers', () => {
  it('should be a function', () => {
    expect(dispatch).to.be.a('function');
  });
});
