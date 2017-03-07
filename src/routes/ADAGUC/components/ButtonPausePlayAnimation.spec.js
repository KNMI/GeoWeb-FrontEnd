import React from 'react';
import { default as ButtonPausePlayAnimation } from './ButtonPausePlayAnimation';
import { shallow } from 'enzyme';

describe('(Component) ButtonPausePlayAnimation', () => {
  it('Renders a div', () => {
    const _component = shallow(<ButtonPausePlayAnimation />);
    expect(_component.type()).to.eql('div');
  });
});
