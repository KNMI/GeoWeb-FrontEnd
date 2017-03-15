import React from 'react';
import { default as TasksContainer } from './TasksContainer';
import { Col } from 'reactstrap';
import { shallow } from 'enzyme';

describe('(Container) TasksContainer', () => {
  it('Renders a ReactStrap Col', () => {
    const _component = shallow(<TasksContainer />);
    expect(_component.type()).to.eql(Col);
  });
});
