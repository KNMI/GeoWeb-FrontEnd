import React from 'react';
import { default as MapActionsContainer } from './MapActionsContainer';
import { Col } from 'reactstrap';
import { shallow } from 'enzyme';

describe('(Container) MapActionsContainer', () => {
  it('Renders a ReactStrap Col', () => {
    const _component = shallow(<MapActionsContainer adagucProperties={{ mapMode: 'pan' }} />);
    expect(_component.type()).to.eql(Col);
  });
});
