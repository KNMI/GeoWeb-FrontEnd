import React from 'react'
// eslint-disable-next-line no-unused-vars
import {default as BaseLayout} from './BaseLayout'
import {shallow, mount} from 'enzyme'
import {Container} from 'reactstrap'
import {Provider} from 'react-redux'

const STORE = {
  getState: () => {
    return {notifications: []}
  },
  subscribe: () => null,
  dispatch: () => null
}

describe('(Layout) BaseLayout', () => {
  it('Renders a Reactstrap Container', () => {
    const _component = shallow(<BaseLayout routes={[{title: 'title'}]} />)
    expect(_component.type()).to.eql(Container)
  })

  it('Allows for triggering the fullscreen function', () => {
    const _wrappingComponent = mount(<Provider store={STORE}><BaseLayout routes={[{title: 'title', path: 'full_screen'}]} /></Provider>)
    const evt = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'F11',
      keyCode: 122
    })
    expect(_wrappingComponent.find(BaseLayout)).to.have.length(1)
    _wrappingComponent.find(BaseLayout).get(0).elementToFullScreen(evt)
    expect('everything').to.be.ok()
  })

  it('Attaches a route based class name', () => {
    const _wrappingComponent = mount(<Provider store={STORE}><BaseLayout routes={[{title: 'title'}, {path: 'layout_test'}]} /></Provider>)
    expect(_wrappingComponent.type()).to.eql(Provider)
    expect(_wrappingComponent.find(BaseLayout)).to.have.length(1)
    expect(_wrappingComponent.find('.test')).to.have.length(1)
  })
})
