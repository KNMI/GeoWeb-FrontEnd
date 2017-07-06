import React from 'react'
import AdagucMeasureDistance from './AdagucMeasureDistance'
import {shallow} from 'enzyme'

const dispatch = () => { /* intentionally left blank */ }

describe('(Component) AdagucMeasureDistance', () => {
  it('Renders a div', () => {
    const _component = shallow(<AdagucMeasureDistance dispatch={dispatch} />)
    expect(_component.type()).to.eql('div')
  })
})
