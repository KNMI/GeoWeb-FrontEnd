import React from 'react';
import TafCategory from './TafCategory';
import { mount } from 'enzyme';
import { TestTafJSON } from './TestTafJSON.js';
// import { TAF_TEMPLATES } from './TafTemplates';

// const taf = TAF_TEMPLATES.TAF;

describe('(Container) Taf/TafCategory.jsx', () => {
  before(() => { sinon.spy(TafCategory.prototype, 'validateTaf'); });
  it('Renders an empty TafCategory', () => {
    const _component = mount(<TafCategory />);
    expect(_component.type()).to.eql(TafCategory);
  });
  it('Renders a TafCategory', () => {
    const _component = mount(<TafCategory urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} taf={TestTafJSON} />);
    expect(_component.type()).to.eql(TafCategory);
  });

  it('Renders an editable TafCategory', () => {
    const _component = mount(<TafCategory urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} editable taf={TestTafJSON} />);
    expect(_component.type()).to.eql(TafCategory);
  });

  /* it('Triggers onkeyup (Escape) and checks if validation is called', () => {
    const _wrappingComponent = mount(<TafCategory urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
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
    TafCategory.prototype.validateTaf.should.have.been.calledOnce();
    expect('everything').to.be.ok();
  });

  it('Triggers onkeyup (Enter) and checks if validation is called', () => {
    const _wrappingComponent = mount(<TafCategory urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
      editable
      taf={taf}
    />);

    const evt = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: 'Enter'
    });
    expect(_wrappingComponent.find(TafCategory)).to.have.length(1);
    _wrappingComponent.find(TafCategory).get(0).onKeyUp(evt);
    TafCategory.prototype.validateTaf.should.have.been.calledTwice();
    expect('everything').to.be.ok();
  });

  it('Triggers onkeyup (ArrowUp) and checks if validation is called', () => {
    const _wrappingComponent = mount(<TafCategory urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
      editable
      taf={taf}
    />);
    const inputs2Focus = _wrappingComponent.find('input[name="forecast-wind"]');
    expect(inputs2Focus).to.have.length(1);
    inputs2Focus.get(0).focus();

    const evt = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowUp'
    });
    expect(_wrappingComponent.find(TafCategory)).to.have.length(1);
    _wrappingComponent.find(TafCategory).get(0).onKeyUp(evt);
    TafCategory.prototype.validateTaf.should.have.been.calledTwice();
    expect('everything').to.be.ok();
  });

  it('Triggers onkeyup (ArrowDown) and checks if validation is called', () => {
    const _wrappingComponent = mount(<TafCategory urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
      editable
      taf={taf}
    />);

    const evt = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowDown'
    });
    expect(_wrappingComponent.find(TafCategory)).to.have.length(1);
    _wrappingComponent.find(TafCategory).get(0).onKeyUp(evt);
    TafCategory.prototype.validateTaf.should.have.been.calledTwice();
    expect('everything').to.be.ok();
  }); */

  it('Handles updating of TAF json', () => {
    const _component = mount(<TafCategory urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    _component.setProps({ taf: TestTafJSON });
    expect(_component.type()).to.eql(TafCategory);
  });
});
