import React from 'react'
// eslint-disable-next-line no-unused-vars
import {default as Inspector} from './Inspector'
import {shallow} from 'enzyme'

describe('(Component) Inspector', () => {
  it('Renders a div', () => {
    const _component = shallow(<Inspector title='title' />)
    expect(_component.type()).to.eql('div')
  })
})
