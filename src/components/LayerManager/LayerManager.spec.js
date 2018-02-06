import React from 'react';
import { default as LayerManager } from './LayerManager';
import { shallow, mount } from 'enzyme';
import { Col } from 'reactstrap';
import { panel } from './TestPanel.json';
import cloneDeep from 'lodash.clonedeep';
describe('(Component) LayerManager', () => {
  let _panel;
  const emptyFunc = () => { /* intentionally left empty */ };
  const empytObj = { /* intentionally left empty */ };
  beforeEach(() => {
    _panel = cloneDeep(panel);
  });
  it('Renders an empty div without layers', () => {
    const _component = mount(<LayerManager dispatch={emptyFunc} actions={empytObj} />);
    expect(_component.type()).to.eql(LayerManager);
  });

  it('Renders renders with layers', () => {
    const _component = shallow(<LayerManager dispatch={emptyFunc} actions={empytObj} panel={_panel} />);
    expect(_component.type()).to.eql(Col);
    const _deepComponent = mount(<LayerManager dispatch={emptyFunc} actions={empytObj} panel={_panel} />);
    expect(_deepComponent.type()).to.eql(LayerManager);
    const overlays = _component.children().get(0).props.data;
    const datalayers = _component.children().get(1).props.data;
    const maplayers = _component.children().get(2).props.data;
    expect(overlays).to.have.lengthOf(1);
    expect(datalayers).to.have.lengthOf(1);
    expect(maplayers).to.have.lengthOf(1);
  });
});
