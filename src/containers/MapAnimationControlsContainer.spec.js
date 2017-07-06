import React from 'react'
import {default as MapAnimationControlsContainer} from './MapAnimationControlsContainer'
import {mount, shallow} from 'enzyme'
import sinon from 'sinon'

const adagucProperties = {
  wmjslayers: {
    layers: [],
    baselayers: [],
    overlays: []
  },
  sources: {
    data: [{name: 'testName', title: 'testTitle'}],
    overlay: []
  }
}

const emptyDispatch = () => { /* intentionally left blank */ }
const emptyActions = {
  toggleAnimation: () => { /* intentionally left blank */ },
  setTimeDimension: () => { /* intentionally left blank */ }
}

describe('(Container) MapAnimationControlsContainer', () => {
  it('Renders a MapAnimationControlsContainer', () => {
    const _component = mount(<MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    expect(_component.type()).to.eql(MapAnimationControlsContainer)
  })
  it('Allows for triggering toggleLayerChooser', () => {
    const _component = mount(<MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    _component.instance().toggleLayerChooser()
    expect('everything').to.be.ok()
  })
  it('Allows for triggering toggleAnimation', () => {
    const _component = mount(<MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    _component.instance().toggleAnimation()
    expect('everything').to.be.ok()
  })
  it('Allows for triggering togglePopside', () => {
    const _component = shallow(<MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    _component.instance().togglePopside()
    expect('everything').to.be.ok()
  })
  it('Allows for triggering generateMap', () => {
    const _component = mount(<MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    _component.instance().generateMap([{name: 'testName', text: 'testText'}])
    expect('everything').to.be.ok()
  })
  it('Allows for triggering goToNow', () => {
    global.getCurrentDateIso8601 = sinon.stub().returns({toISO8601: () => { /* intentionally left blank */ }})
    const _component = mount(<MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    _component.instance().goToNow()
    expect('everything').to.be.ok()
  })
  it('Allows for triggering getLayerName', () => {
    const _component = mount(<MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    let obs = _component.instance().getLayerName({title: 'OBS'})
    expect(obs).to.eql('Observations')
    obs = _component.instance().getLayerName({title: 'SAT'})
    expect(obs).to.eql('Satellite')
    obs = _component.instance().getLayerName({title: 'LGT'})
    expect(obs).to.eql('Lightning')
    obs = _component.instance().getLayerName({title: 'HARM_N25_EXT'})
    expect(obs).to.eql('HARMONIE (EXT)')
    obs = _component.instance().getLayerName({title: 'HARM_N25'})
    expect(obs).to.eql('HARMONIE')
    obs = _component.instance().getLayerName({title: 'OVL'})
    expect(obs).to.eql('Overlay')
    obs = _component.instance().getLayerName({title: 'RADAR_EXT'})
    expect(obs).to.eql('Radar (EXT)')
    expect('everything').to.be.ok()
  })
  it('Allows for setting addLayer state', () => {
    const _component = mount(<MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    _component.setState({action: 'addLayer'})
    expect('everything').to.be.ok()
  })
  it('Allows for setting selectPreset state', () => {
    const _component = mount(<MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    _component.setState({action: 'selectPreset'})
    expect('everything').to.be.ok()
  })
})
