import React from 'react';
import TafCategory from './TafCategory';
import { mount } from 'enzyme';
import { TestTafJSON } from './TestTafJSON.js';

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
  it('Handles updating of TAF json', () => {
    const _component = mount(<TafCategory urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    _component.setProps({ taf: TestTafJSON });
    expect(_component.type()).to.eql(TafCategory);
  });
});
