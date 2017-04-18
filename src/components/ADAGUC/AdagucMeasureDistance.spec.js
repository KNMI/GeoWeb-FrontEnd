import React from 'react';
import AdagucMeasureDistance, { haverSine } from './AdagucMeasureDistance';
import { shallow } from 'enzyme';

const dispatch = () => {};

describe('(Component) AdagucMeasureDistance', () => {
  it('Renders a div', () => {
    const _component = shallow(<AdagucMeasureDistance dispatch={dispatch} />);
    expect(_component.type()).to.eql('div');
  });

  describe('(Haversine)', () => {
    it('Should measure a distance between LAX and Nashville airport of approx. 2886 kilometres', () => {
      const nashville = { x: -86.67, y: 36.12 };
      const lax = { x: -118.4, y: 33.94 };
      const distbear = haverSine(nashville, lax);
      expect(Math.trunc(distbear.distance)).to.equal(2886444); // meters
    });
  });
});
