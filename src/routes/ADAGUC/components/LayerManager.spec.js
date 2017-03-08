import React from 'react';
import { default as LayerManager } from './LayerManager';
import { mount, shallow } from 'enzyme';
import sinon from 'sinon';

describe('(Component) LayerManager', () => {
  const layers = {
    datalayers: [
      {
        type: 'data',
        title: 'HARM_N25',
        label: 'abc'
      }, {
        type: '@@@@',
        title: '@@@@',
        label: '@@@@'
      }
    ],
    overlays: [
      {
        type: 'overlay',
        title: 'FIR',
        label: 'FIR'
      }
    ]
  };
  it('Renders an empty div without layers', () => {
    const _component = shallow(<LayerManager dispatch={() => {}} actions={{}} />);
    expect(_component.type()).to.eql('div');
    const _deepComponent = shallow(<LayerManager dispatch={() => {}} actions={{}} layers={{ overlays: [], datalayers: [] }} />);
    expect(_deepComponent.type()).to.eql('div');
  });

  it('Renders a non-empty div with a layer', () => {
    const _component = mount(<LayerManager dispatch={() => {}} actions={{}} layers={layers} />);
    var inners = _component.find('span.badge').map((layer) => { return layer.text(); }).filter((text) => text !== '');
    expect(inners).to.have.length(8);
    expect(inners).to.include('HARMONIE');
    expect(inners).to.include('abc');
  });

  it('Deletes an overlay layer when the cross next to it is clicked', () => {
    const _dispatchSpy = sinon.spy();
    const _deleteLayer = sinon.spy((layer) =>
      expect(layer.title).to.equal('FIR')
    );
    const _component = mount(<LayerManager dispatch={_dispatchSpy} actions={{ deleteLayer: _deleteLayer }} layers={layers} />);
    expect(_component.find('#deleteButton')).to.have.length(3);
    _component.find('#deleteButton').at(0).simulate('click');
    _dispatchSpy.should.have.been.calledOnce;
    _deleteLayer.should.have.been.calledOnce;
  });

  it('Deletes a data layer when the cross next to it is clicked', () => {
    const _dispatchSpy = sinon.spy();
    const _deleteLayer = sinon.spy((layer) =>
      expect(layer.title).to.equal('HARM_N25')
    );
    const _component = mount(<LayerManager dispatch={_dispatchSpy} actions={{ deleteLayer: _deleteLayer }} layers={layers} />);
    _component.find('#deleteButton').at(1).simulate('click');
    _dispatchSpy.should.have.been.calledOnce;
    _deleteLayer.should.have.been.calledOnce;
  });
  it('Does nothing when an unknown layer is attempted to be deleted', () => {
    const _dispatchSpy = sinon.spy((layer) => expect(layer).to.equal(undefined));
    const _component = mount(<LayerManager dispatch={_dispatchSpy} actions={{ deleteLayer: sinon.spy() }} layers={layers} />);
    _component.find('#deleteButton').at(2).simulate('click');
    _dispatchSpy.should.have.been.calledOnce;
  });
});
