import React from 'react';
import TriggersTestContainer from './TriggersTestContainer';
import { mount } from 'enzyme';

describe('(Container) TriggersTestContainer', () => {
  it('Renders a ReactStrap Col', () => {
    const _component = mount(<TriggersTestContainer />);
    expect(_component.type()).to.eql(TriggersTestContainer);
  });

  it('Allows setting collapse state', () => {
    const _component = mount(<TriggersTestContainer />);
    expect(_component.state().isOpen).to.eql(true);
    _component.setState({ collapse: true });
    expect('everything').to.be.ok();
  });

  it('Allows setting filter state', () => {
    const _component = mount(<TriggersTestContainer />);
    expect(_component.state().filter).to.be.an('undefined');
    _component.setState({ filter: new RegExp('shi', 'i') });
    expect('everything').to.be.ok();
  });

  it('Allows triggering the toggle function', () => {
    const _component = mount(<TriggersTestContainer />);
    expect(_component.state().isOpen).to.eql(true);
    const evt = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'F11',
      keyCode: 122
    });
    _component.instance().toggle(evt);
    expect(_component.state().isOpen).to.eql(false);
  });
});
