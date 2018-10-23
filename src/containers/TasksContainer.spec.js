import React from 'react';
import TasksContainer from './TasksContainer';
import { mount } from 'enzyme';

describe('(Container) TasksContainer', () => {
  it('Renders a ReactStrap Col', () => {
    const _component = mount(<TasksContainer />);
    expect(_component.type()).to.eql(TasksContainer);
  });

  it('Allows setting collapse state', () => {
    const _component = mount(<TasksContainer />);
    expect(_component.state().isOpen).to.eql(false);
    _component.setState({ collapse: true });
    expect('everything').to.be.ok();
  });

  it('Allows setting filter state', () => {
    const _component = mount(<TasksContainer />);
    expect(_component.state().filter).to.be.an('undefined');
    _component.setState({ filter: new RegExp('shi', 'i') });
    expect('everything').to.be.ok();
  });

  it('Allows triggering the toggle function', () => {
    const _component = mount(<TasksContainer />);
    expect(_component.state().isOpen).to.eql(false);
    const evt = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'F11',
      keyCode: 122
    });
    _component.instance().toggle(evt);
    expect(_component.state().isOpen).to.eql(true);
  });
});
