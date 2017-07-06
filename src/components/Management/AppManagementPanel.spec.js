import React from 'react'
import AppManagementPanel from './AppManagementPanel'
import Panel from '../Panel'
import {mount, shallow} from 'enzyme'

describe('(Component) AppManagementPanel', () => {
  it('Shallow renders a Panel', () => {
    const _component = shallow(<AppManagementPanel />)
    expect(_component.type()).to.equal(Panel)
  })
  it('Renders an AppManagementPanel', () => {
    const _component = mount(<AppManagementPanel />)
    expect(_component.type()).to.equal(AppManagementPanel)
  })
})
