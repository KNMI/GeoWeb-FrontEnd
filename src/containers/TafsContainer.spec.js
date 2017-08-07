import React from 'react';
import TafsContainer from './TafsContainer';
import { mount, shallow } from 'enzyme';
import { Col } from 'reactstrap';

const emptyDispatch = () => { /* intentionally left blank */ };
const emptyActions = { setGeoJSON: () => { /* intentionally left blank */ } };

describe('(Container) TafsContainer', () => {
  it('Renders a ReactStrap Col', () => {
    const _component = shallow(<TafsContainer />);
    expect(_component.type()).to.eql(Col);
  });

  it('Allows setting collapse state', () => {
    const _component = mount(<TafsContainer />);
    expect(_component.state().isOpen).to.eql(true);
    _component.setState({ collapse: true });
    expect('everything').to.be.ok();
  });

  it('Allows triggering the toggle function', () => {
    const _component = mount(<TafsContainer dispatch={emptyDispatch} drawActions={emptyActions} />);
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
