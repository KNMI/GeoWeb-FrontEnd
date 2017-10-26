import React from 'react';
import TafCategory from './TafCategory';
import { mount } from 'enzyme';
import { TestTafJSON } from './TestTafJSON.js';
describe('(Container) Taf/TafCategory.jsx', () => {
  it('Renders a TafCategory', () => {
    const _component = mount(<TafCategory taf={TestTafJSON} />);
    expect(_component.type()).to.eql(TafCategory);
  });

  it('Renders an editable TafCategory', () => {
    const _component = mount(<TafCategory editable taf={TestTafJSON} />);
    expect(_component.type()).to.eql(TafCategory);
  });

  it('Triggers onkeyup key 27 and checks if validationis called', () => {
    const validateTafFunction = sinon.spy();
    const _wrappingComponent = mount(<TafCategory
      editable
      taf={TestTafJSON}
      saveTaf={() => {}}
      validateTaf={validateTafFunction}
      validationReport={{}}
    />);
    const evt = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'ESC',
      keyCode: 27
    });
    expect(_wrappingComponent.find(TafCategory)).to.have.length(1);
    _wrappingComponent.find(TafCategory).get(0).onKeyUp(evt);
    validateTafFunction.should.have.been.calledOnce();
    expect('everything').to.be.ok();
  });

  // <TafCategory
  //               taf={this.state.inputValueJSON}
  //               validationReport={this.state.validationReport}
  //               editable={this.props.tafEditable}
  //               saveTaf={this.saveTaf}
  //               validateTaf={this.validateTaf} />
});
