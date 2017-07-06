import React from 'react'
import FileNotFound from './FileNotFound'
import {mount} from 'enzyme'

describe('(View) FileNotFound', () => {
  let _component

  beforeEach(() => {
    _component = mount(<FileNotFound />)
  })

  it('Renders a scary message', () => {
    const welcome = _component.find('h4')
    expect(welcome).to.exist()
    expect(welcome.text()).to.match(/This is not the duck you are looking for!/)
  })

  it('Renders an awesome duck image', () => {
    const duck = _component.find('img')
    expect(duck.props().alt).to.match(/This is a duck, because Redux!/)
  })
})
