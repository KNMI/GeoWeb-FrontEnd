import dummyReducer from './dummyReducer';
describe('(Store) dummyReducer', () => {
  it('Always returns the same state', () => {
    const initialState = 'asdfklhsdfiughaidfg';
    const returnedState = dummyReducer(initialState);
    expect(returnedState).to.equal(initialState);
  });
});
