import React from 'react';
// eslint-disable-next-line no-unused-vars
import { default as AppContainer } from './AppContainer';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';

describe('(Container) AppContainer', () => {
  // These things are required....
  const store = {
    asyncReducers: {
      // intentionally left blank
    },
    dispatch: () => {
      // intentionally left blank
    },
    getState: () => {
      // intentionally left blank
    },
    liftedStore: {},
    replaceReducer: () => {
      // intentionally left blank
    },
    subscribe: () => {
      // intentionally left blank
    },
    unsubscribeHistory: () => {
      // intentionally left blank
    }
  };
  it('Renders a Redux Provider', () => {
    const _component = shallow(<AppContainer routes={{}} store={store} />);
    expect(_component.type()).to.eql(Provider);
  });

  it('Renders a AppContainer', () => {
    const _component = mount(<AppContainer routes={{}} store={store} />);
    expect(_component.type()).to.eql(AppContainer);
  });

  it('Handles store-property updates', () => {
    const _component = mount(<AppContainer routes={{}} store={store} />);
    store.test = true;
    _component.setProps({ store: store });
    expect(_component.type()).to.eql(AppContainer);
    _component.unmount();
  });
});
