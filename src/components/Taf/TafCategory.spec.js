import React from 'react';
import TafCategory from './TafCategory';
import { mount } from 'enzyme';
import { TestTafJSON } from './TestTafJSON.js';
describe('(Container) Taf/TafCategory.jsx', () => {
  before(() => { sinon.spy(TafCategory.prototype, 'validateTAF'); });
  it('Renders a TafCategory', () => {
    const _component = mount(<TafCategory taf={TestTafJSON} />);
    expect(_component.type()).to.eql(TafCategory);
  });

  it('Renders an editable TafCategory', () => {
    const _component = mount(<TafCategory editable taf={TestTafJSON} />);
    expect(_component.type()).to.eql(TafCategory);
  });

  it('Triggers onkeyup key 27 and checks if validation is called', () => {
    const _wrappingComponent = mount(<TafCategory
      editable
      taf={TestTafJSON}
    />);

    const evt = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: 'Escape'
    });
    expect(_wrappingComponent.find(TafCategory)).to.have.length(1);
    _wrappingComponent.find(TafCategory).get(0).onKeyUp(evt);
    TafCategory.prototype.validateTAF.should.have.been.calledOnce();
    expect('everything').to.be.ok();
  });

  it('Triggers onkeyup (Enter) key 13 and checks if validation is called', () => {
    const _wrappingComponent = mount(<TafCategory
      editable
      taf={TestTafJSON}
    />);

    const evt = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: 'Enter'
    });
    expect(_wrappingComponent.find(TafCategory)).to.have.length(1);
    _wrappingComponent.find(TafCategory).get(0).onKeyUp(evt);
    TafCategory.prototype.validateTAF.should.have.been.calledTwice();
    expect('everything').to.be.ok();
  });

  it('Triggers onkeyup (key arrow up, key 38) and checks if validation is called', () => {
    const _wrappingComponent = mount(<TafCategory
      editable
      taf={TestTafJSON}
    />);

    const evt = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowUp'
    });
    expect(_wrappingComponent.find(TafCategory)).to.have.length(1);
    _wrappingComponent.find(TafCategory).get(0).onKeyUp(evt);
    TafCategory.prototype.validateTAF.should.have.been.calledTwice();
    expect('everything').to.be.ok();
  });

  it('Triggers onkeyup (key arrow down, key 40) and checks if validation is called', () => {
    const _wrappingComponent = mount(<TafCategory
      editable
      taf={TestTafJSON}
    />);

    const evt = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowDown'
    });
    expect(_wrappingComponent.find(TafCategory)).to.have.length(1);
    _wrappingComponent.find(TafCategory).get(0).onKeyUp(evt);
    TafCategory.prototype.validateTAF.should.have.been.calledTwice();
    expect('everything').to.be.ok();
  });

  it('Handles updating of TAF json', () => {
    const _component = mount(<TafCategory />);
    _component.setProps({ taf: TestTafJSON });
    expect(_component.type()).to.eql(TafCategory);
  });
});
