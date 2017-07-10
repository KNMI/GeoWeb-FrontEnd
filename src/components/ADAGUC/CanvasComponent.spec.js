import React from 'react';
// eslint-disable-next-line no-unused-vars
import { default as CanvasComponent } from './CanvasComponent';
import { shallow } from 'enzyme';

describe('(Component) CanvasComponent', () => {
  it('Renders a canvas', () => {
    const _component = shallow(<CanvasComponent />);
    expect(_component.type()).to.eql('canvas');
  });
});
