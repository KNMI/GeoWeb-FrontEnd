import locationReducer, { locationChange } from './location';
describe('(Store) location', () => {
  let initState;
  beforeEach(() => {
    initState = locationReducer();
  });
  it('starts with an empty state', () => {
    expect(initState).to.equal(null);
  });

  it('disregards the initialstate', () => {
    const filledState = locationReducer('/asdf');
    expect(filledState).to.equal('/asdf');
    const newState = locationReducer(filledState, locationChange('/hi'));
    expect(newState).to.equal('/hi');
  });

  it('changes the location appropriately', () => {
    const newState = locationReducer(initState, locationChange('/hi'));
    expect(newState).to.exist();
    expect(newState).to.equal('/hi');
  });
});
