import React from 'react';
import CategoryCardLayout from './CategoryCardLayout';
import { mount } from 'enzyme';
import { Col } from 'reactstrap';

describe('(Layout) CategoryCardLayout', () => {
  it('renders', () => {
    const _component = mount(<CategoryCardLayout>
      <span data-role='name'>test</span>
    </CategoryCardLayout>);
    expect('everything').to.be.ok();
    const cardWrapper = _component.find('.CategoryCard');
    expect(cardWrapper.first().type()).to.eql(Col);
  });
});
