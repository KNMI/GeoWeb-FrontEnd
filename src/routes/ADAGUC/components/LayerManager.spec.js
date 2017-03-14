import React from 'react';
import { default as LayerManager } from './LayerManager';
// import { mount, shallow } from 'enzyme';
import { shallow } from 'enzyme';
// import sinon from 'sinon';
import { Col } from 'reactstrap';
describe('(Component) LayerManager', () => {
  it('Renders an empty div without layers', () => {
    const _component = shallow(<LayerManager dispatch={() => {}} actions={{}} />);
    expect(_component.type()).to.eql(Col);
    const _deepComponent = shallow(<LayerManager dispatch={() => {}} actions={{}} layers={{ overlays: [], datalayers: [] }} />);
    expect(_deepComponent.type()).to.eql(Col);
  });
});
