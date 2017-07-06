import React from 'react'
import {default as CollapseOmni} from './CollapseOmni'
import {mount} from 'enzyme'

describe('(Component) CollapseOmni', () => {
  let _component

  it('Renders a collapsed CollapseOmni', () => {
    _component = mount(<CollapseOmni />)
    expect(_component.type()).to.eql(CollapseOmni)
    expect(_component.props().isOpen).to.eql(false)
    expect(_component.props().isHorizontal).to.eql(false)
    expect(_component.props().minSize).to.eql(0)
  })
  it('Renders a unfolded CollapseOmni', () => {
    _component = mount(<CollapseOmni isOpen />)
    expect(_component.type()).to.eql(CollapseOmni)
    expect(_component.props().isOpen).to.eql(true)
    expect(_component.props().isHorizontal).to.eql(false)
    expect(_component.props().minSize).to.eql(0)
  })
  it('Renders a horizontal CollapseOmni', () => {
    _component = mount(<CollapseOmni isHorizontal />)
    expect(_component.type()).to.eql(CollapseOmni)
    expect(_component.props().isOpen).to.eql(false)
    expect(_component.props().isHorizontal).to.eql(true)
    expect(_component.props().minSize).to.eql(0)
  })
  it('Renders a CollapseOmni with remaining minimal size', () => {
    _component = mount(<CollapseOmni minSize={21} />)
    expect(_component.type()).to.eql(CollapseOmni)
    expect(_component.props().isOpen).to.eql(false)
    expect(_component.props().isHorizontal).to.eql(false)
    expect(_component.props().minSize).to.eql(21)
  })
  it('Allows for setting the isOpen property', () => {
    _component = mount(<CollapseOmni />)
    _component.setProps({isOpen: true})
    expect(_component.props().isOpen).to.eql(true)
  })
  it('Allows for setting the isHorizontal property', () => {
    _component = mount(<CollapseOmni />)
    _component.setProps({isHorizontal: true})
    expect(_component.props().isHorizontal).to.eql(true)
  })
  it('Allows for setting the minSize property', () => {
    _component = mount(<CollapseOmni />)
    _component.setProps({minSize: 23})
    expect(_component.props().minSize).to.eql(23)
  })
  it('Allows for setting the maxSize property', () => {
    _component = mount(<CollapseOmni />)
    _component.setProps({maxSize: 321})
    expect(_component.props().maxSize).to.eql(321)
  })
  it('Allows for collapsing', () => {
    _component = mount(<CollapseOmni minSize={27} maxSize={323} isOpen />)
    expect(_component.props().maxSize).to.eql(323)
    expect(_component.hasClass('collapse')).to.eql(true)
    expect(_component.hasClass('show')).to.eql(true)
    _component.setProps({isOpen: false})
    expect(_component.hasClass('collapse')).to.eql(false)
    expect(_component.hasClass('collapsing')).to.eql(true)
    expect(_component.props().isOpen).to.eql(false)
    expect(_component.hasClass('remain')).to.eql(true)
    expect(_component.hasClass('height')).to.eql(true)
    expect(_component.hasClass('show')).to.eql(false)
  })
})
