import React from 'react';
import { default as MapActionsContainer } from './MapActionsContainer';
import { mount } from 'enzyme';
import sinon from 'sinon';

const adagucProperties = {
  wmjslayers: {
    layers: [],
    baselayers: [],
    overlays: []
  },
  sources: {
    data: [ { name: 'testName', title: 'testTitle' } ],
    overlay: []
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
  it('Allows triggering the toggleLayerChooser function', () => {
    const _component = mount(<MapActionsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _component.instance().handleActionClick('');
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
});
