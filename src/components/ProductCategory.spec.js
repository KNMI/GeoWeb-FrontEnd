import React from 'react'
import {default as ProductCategory} from './ProductCategory'
import {mount} from 'enzyme'

describe('(Container) ProductCategory', () => {
  it('Renders a ProductCategory', () => {
    const _component = mount(<ProductCategory title={'test'} icon='star' />)
    expect(_component.type()).to.eql(ProductCategory)
  })
})
