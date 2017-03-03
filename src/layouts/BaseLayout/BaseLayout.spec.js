import React from 'react';
// eslint-disable-next-line no-unused-vars
import { default as BaseLayout } from './BaseLayout';
import { shallow } from 'enzyme';
import { Container } from 'reactstrap';

describe('(Layout) BaseLayout', () => {
  it('Renders a Reactstrap Container', () => {
    const _component = shallow(<BaseLayout />);
    expect(_component.type()).to.eql(Container);
  });
});
