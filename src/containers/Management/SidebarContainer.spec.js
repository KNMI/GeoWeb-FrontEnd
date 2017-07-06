import React from 'react'
// eslint-disable-next-line no-unused-vars
import SidebarContainer from './SidebarContainer'
import Panel from '../../components/Panel'
import {shallow, mount} from 'enzyme'

describe('(Container) SidebarContainer', () => {
  it('Shallow renders a Panel', () => {
    const _component = shallow(<SidebarContainer />)
    expect(_component.type()).to.eql(Panel)
  })
  it('Renders a SidebarContainer', () => {
    const _component = mount(<SidebarContainer />)
    expect(_component.type()).to.eql(SidebarContainer)
  })
})
