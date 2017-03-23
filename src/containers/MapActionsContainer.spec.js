import React from 'react';
import { default as MapActionsContainer } from './MapActionsContainer';
import { mount, shallow } from 'enzyme';
import sinon from 'sinon';

const adagucProperties = {
  wmjslayers: {
    layers: [],
    baselayers: [],
    overlays: []
  },
  sources: {
    data: [ { name: 'testName', title: 'testTitle' } ],
    overlay: [ { name: 'testName', title: 'testTitle' } ]
  },
  mapMode: 'pan'
};

const emptyDispatch = () => {};
const emptyActions = { toggleAnimation: () => {}, setTimeDimension: () => {}, setMapMode: () => {} };

describe('(Container) MapActionsContainer', () => {
  it('Renders a ReactStrap Col', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(MapActionsContainer);
  });
  it('Adds a data layer', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(MapActionsContainer);
  });
  it('Allows for triggering toggleLayerChooser', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.instance().toggleLayerChooser();
    expect('everything').to.be.ok;
  });
  it('Allows for triggering toggleAnimation', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.instance().toggleAnimation();
    expect('everything').to.be.ok;
  });
  it('Allows for triggering togglePopside', () => {
    const _component = shallow(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.instance().togglePopside();
    expect('everything').to.be.ok;
  });
  it('Allows for triggering goToNow', () => {
    global.getCurrentDateIso8601 = sinon.stub().returns({ toISO8601: () => {} });
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.instance().goToNow();
    expect('everything').to.be.ok;
  });
  it('Allows for triggering generateMap', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.instance().generateMap([{ name: 'testName', text: 'testText' }]);
    expect('everything').to.be.ok;
  });
  it('Allows for triggering getLayerName', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    let obs = _component.instance().getLayerName({ title: 'OBS' });
    expect(obs).to.eql('Observations');
    obs = _component.instance().getLayerName({ title: 'SAT' });
    expect(obs).to.eql('Satellite');
    obs = _component.instance().getLayerName({ title: 'LGT' });
    expect(obs).to.eql('Lightning');
    obs = _component.instance().getLayerName({ title: 'HARM_N25_EXT' });
    expect(obs).to.eql('HARMONIE (EXT)');
    obs = _component.instance().getLayerName({ title: 'HARM_N25' });
    expect(obs).to.eql('HARMONIE');
    obs = _component.instance().getLayerName({ title: 'OVL' });
    expect(obs).to.eql('Overlay');
    obs = _component.instance().getLayerName({ title: 'RADAR_EXT' });
    expect(obs).to.eql('Radar (EXT)');
    expect('everything').to.be.ok;
  });
  it('Allows for triggering padLeft', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    const result = _component.instance().padLeft('23', 5, '0');
    expect(result).to.eql('00023');
  });
  it('Allows for setting addLayer action state', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.setState({ action: 'addLayer' });
    expect('everything').to.be.ok;
  });
  it('Allows for setting selectPreset action state', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.setState({ action: 'selectPreset' });
    expect('everything').to.be.ok;
  });
  it('Allows for setting collapse state', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.setState({ collapse: true });
    expect('everything').to.be.ok;
  });
  it('Allows for setting popoverOpen state', () => {
    const _component = shallow(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.setState({ popoverOpen: true });
    expect('everything').to.be.ok;
  });
  it('Allows for setting layerChooserOpen state', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.setState({ layerChooserOpen: true });
    expect('everything').to.be.ok;
  });
});
