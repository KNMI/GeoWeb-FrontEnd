import React from 'react';
import { default as TimeComponent } from './TimeComponent';
import { shallow } from 'enzyme';

describe('(Component) TimeComponent', () => {
  let _timeComponent;
  beforeEach(() => {
    _timeComponent = shallow(<TimeComponent />);
  });

  it('Renders a div', () => {
    expect(_timeComponent.type()).to.eql('div');
  });
});
