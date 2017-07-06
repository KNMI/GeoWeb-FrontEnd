import React from 'react'
// eslint-disable-next-line no-unused-vars
import {default as Empty} from './Empty'
import {shallow} from 'enzyme'

describe('(Component) Empty', () => {
  it('Renders a div', () => {
    const _component = shallow(<Empty />)
    expect(_component.type()).to.eql('div')
  })
})
