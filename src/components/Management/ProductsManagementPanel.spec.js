import React from 'react'
import ProductsManagementPanel from './ProductsManagementPanel'
import Panel from '../Panel'
import {mount, shallow} from 'enzyme'

describe('(Component) ProductsManagementPanel', () => {
  it('Shallow renders a Panel', () => {
    const _component = shallow(<ProductsManagementPanel />)
    expect(_component.type()).to.equal(Panel)
  })
  it('Renders an ProductsManagementPanel', () => {
    const _component = mount(<ProductsManagementPanel />)
    expect(_component.type()).to.equal(ProductsManagementPanel)
  })
})
