import React from 'react'
import {default as LayerManagerPanel} from './LayerManagerPanel'
import Panel from './Panel'
import {shallow} from 'enzyme'

const adagucProperties = {
  wmjslayers: {
    layers: [],
    baselayers: [],
    overlays: []
  },
  timedim: ''
}

const emptyDispatch = () => { /* intentionally left blank */ }
const emptyActions = {}

describe('(Component) LayerManagerPanel', () => {
  it('Renders a LayerManagerPanel', () => {
    const _component = shallow(<LayerManagerPanel title='title' adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />)
    expect(_component.type()).to.eql(Panel)
  })
})
