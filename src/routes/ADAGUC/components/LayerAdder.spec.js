import React from 'react';
import { default as LayerAdder } from './LayerAdder';
import { mount } from 'enzyme';
import sinon from 'sinon';
describe('(Component) LayerAdder', () => {
  it('Opens a menu when the add layer button is clicked', () => {
    const _component = mount(<LayerAdder dispatch={sinon.spy()} actions={{}} sources={{}} />);
    const button = _component.find('#addLayerButton');
    expect(button).to.exist;
    expect(button).to.have.length(1);
    button.simulate('click');
    expect(_component.state().modal).to.equal(true);
  });
});
