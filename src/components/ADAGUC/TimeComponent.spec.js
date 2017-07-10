import React from 'react';
import { default as TimeComponent } from './TimeComponent';
import { shallow } from 'enzyme';
import { Col } from 'reactstrap';

describe('(Component) TimeComponent', () => {
  let _timeComponent;
  beforeEach(() => {
    _timeComponent = shallow(<TimeComponent />);
  });

  it('Renders a Col', () => {
    expect(_timeComponent.type()).to.eql(Col);
  });
});
