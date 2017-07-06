import React from 'react'
import {default as ProgtempComponent} from './ProgtempComponent'
import {mount} from 'enzyme'
import sinon from 'sinon'

const adagucProperties = {
  wmjslayers: {
    layers: [],
    baselayers: [],
    overlays: []
  }
}

const emptyDispatch = () => { /* intentionally left blank */ }
const emptyActions = {}

describe('(Component) ProgtempComponent', () => {
  it('Renders a ProgtempComponent', () => {
    global.drawProgtempBg = sinon.stub().returns('asdf')
    const _component = mount(<ProgtempComponent adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    expect(_component.type()).to.eql(ProgtempComponent)
  })
})
