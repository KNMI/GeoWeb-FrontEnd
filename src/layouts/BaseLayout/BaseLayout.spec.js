import React from 'react';
import { default as BaseLayout } from './BaseLayout';
import { shallow, mount } from 'enzyme';
import { Container } from 'reactstrap';
import { Provider } from 'react-redux';

const STORE = {
  getState: () => ({ notifications: [] }),
  subscribe: () => null,
  dispatch: () => null
};

describe('(Layout) BaseLayout', () => {
  it('Renders a Reactstrap Container', () => {
    const _component = shallow(<BaseLayout route={{}} />);
    expect(_component.type()).to.eql(Container);
  });

  it('Allows for triggering the fullscreen function', () => {
    const _wrappingComponent = mount(<Provider store={STORE}><BaseLayout routes={[{ title: 'title', path: 'full_screen' }]} /></Provider>);
    const evt = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'F11',
      keyCode: 122
    });
    expect(_wrappingComponent.find(BaseLayout)).to.have.length(1);
    _wrappingComponent.find(BaseLayout).get(0).elementToFullScreen(evt);
    expect('everything').to.be.ok();
  });
});
