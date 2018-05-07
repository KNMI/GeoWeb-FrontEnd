import React from 'react';
import ContainerHeader from './ContainerHeader';
import { mount, shallow } from 'enzyme';
import { Row } from 'reactstrap';

const TOGGLE_ACTION = 'TOGGLE_ACTION';
const testDispatch = sinon.spy();
const testActions = { toggleContainerAction: (evt) => { return TOGGLE_ACTION; } };

describe('(Container) ContainerHeader', () => {
  it('mount renders a ContainerHeader', () => {
    const _component = mount(<ContainerHeader isContainerOpen dispatch={testDispatch} actions={testActions} />);
    expect(_component.type()).to.eql(ContainerHeader);
  });

  it('shallow renders a ReactStrap Row', () => {
    const _component = shallow(<ContainerHeader isContainerOpen dispatch={testDispatch} actions={testActions} />);
    expect(_component.type()).to.eql(Row);
  });

  it('dispatches toggleContainerAction on clicking \'collapse\'-button', () => {
    const _component = mount(<ContainerHeader isContainerOpen dispatch={testDispatch} actions={testActions} />);
    expect('everything').to.be.ok();
    const buttons = _component.find('button');
    expect(buttons).to.have.length(2);
    buttons.first().simulate('click');
    expect(testDispatch).to.have.been.calledOnce();
    expect(testDispatch).to.have.been.calledWith(TOGGLE_ACTION);
  });
});
