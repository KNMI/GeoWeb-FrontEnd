import React from 'react';
// eslint-disable-next-line no-unused-vars
import { default as AppContainer } from './AppContainer';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';

describe('(Container) AppContainer', () => {
  // These things are required....
  const store = {
    asyncReducers: {},
    dispatch: () => {},
    getState: () => {},
    liftedStore: {},
    replaceReducer: () => {},
    subscribe: () => {},
    unsubscribeHistory: () => {}
  };
  it('Renders a Redux Provider', () => {
    const _component = shallow(<AppContainer routes={{}} store={store} />);
    expect(_component.type()).to.eql(Provider);
  });
});
