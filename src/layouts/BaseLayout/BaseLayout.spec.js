import React from 'react';
// eslint-disable-next-line no-unused-vars
import { default as BaseLayout } from './BaseLayout';
import { shallow, mount } from 'enzyme';
import { Container } from 'reactstrap';

describe('(Layout) BaseLayout', () => {
  it('Renders a Reactstrap Container', () => {
    const _component = shallow(<BaseLayout routes={[ { title: 'title' } ]} />);
    expect(_component.type()).to.eql(Container);
  });

  it('Allows for triggering the fullscreen function', () => {
    const _component = mount(<BaseLayout routes={[ { title: 'title', path: 'full_screen' } ]} />);
    let evt = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'F11',
      keyCode: 122
    });
    _component.instance().elementToFullScreen(evt);
    expect('everything').to.be.ok();
  });

  it('Attaches a route based class name', () => {
    const _component = mount(<BaseLayout routes={[ { title: 'title' }, { path: 'layout_test' } ]} />);
    expect(_component.type()).to.eql(BaseLayout);
    expect(_component.hasClass('test')).to.eql(true);
  });
});
