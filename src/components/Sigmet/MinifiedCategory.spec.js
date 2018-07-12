import React from 'react';
import MinifiedCategory from './MinifiedCategory';
import { mount, shallow } from 'enzyme';
import { Card } from 'reactstrap';

describe('(Component) MinifiedCategory', () => {
  it('mount renders a MinifiedCategory', () => {
    const _component = mount(<MinifiedCategory />);
    expect(_component.type()).to.eql(MinifiedCategory);
  });

  it('shallow renders a ReactStrap Card', () => {
    const _component = shallow(<MinifiedCategory />);
    expect(_component.type()).to.eql(Card);
  });
});
