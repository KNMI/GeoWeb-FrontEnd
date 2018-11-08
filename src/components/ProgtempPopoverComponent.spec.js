import React from 'react';
import ProgtempPopoverComponent from './ProgtempPopoverComponent';
import { mount } from 'enzyme';
import sinon from 'sinon';

const adagucProperties = {
  wmjslayers: {
    panelsProperties: [],
    baselayers: [],
    overlays: []
  }
};

const emptyDispatch = () => { /* intentionally left blank */ };
const emptyActions = {};

describe('(Component) ProgtempPopoverComponent', () => {
  it('Renders a ProgtempPopoverComponent', () => {
    global.drawProgtempBg = sinon.stub().returns('asdf');
    const _component = mount(<ProgtempPopoverComponent adagucProperties={adagucProperties} isOpen dispatch={emptyDispatch} adagucActions={emptyActions} urls={{}} />);
    expect(_component.type()).to.eql(ProgtempPopoverComponent);
  });
});
