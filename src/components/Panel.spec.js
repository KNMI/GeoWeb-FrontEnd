import React from 'react'
import {default as Panel} from './Panel'
import {mount} from 'enzyme'

describe('(Container) Panel', () => {
  it('Renders a ReactStrap Col', () => {
    const _component = mount(<Panel />)
    expect(_component.type()).to.eql(Panel)
    const title = _component.find('.row.title')
    const content = _component.find('.row.content')
    expect(title).to.have.length(1)
    expect(content).to.have.length(1)
    expect(title.hasClass('notitle')).to.eql(true)
    expect(content.hasClass('notitle')).to.eql(true)
  })
  it('Renders a ReactStrap Col', () => {
    const _component = mount(<Panel title={'test'} />)
    expect(_component.type()).to.eql(Panel)
    const title = _component.find('.row.title')
    const content = _component.find('.row.content')
    expect(title).to.have.length(1)
    expect(content).to.have.length(1)
    expect(title.hasClass('notitle')).to.eql(false)
    expect(content.hasClass('notitle')).to.eql(false)
  })
})
