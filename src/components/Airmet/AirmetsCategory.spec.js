import React from 'react';
import AirmetsCategory from './AirmetsCategory';
import { mount, shallow } from 'enzyme';
import { Card } from 'reactstrap';

describe('(Component) AirmetsCategory', () => {
  it('mount renders a AirmetsCategory', () => {
    const parameters = {
      location_indicator_mwo: 'EHDB',
      active_firs: ['EHAA'],
      firareas: { EHAA: {} }
    };
    const phenomena = [{
      code: 'OCNL_TSGR',
      layerpreset: 'airmet_layer_TS',
      name: 'Occasional thunderstorms with hail'
    }];
    const _component = mount(<AirmetsCategory airmets={[]} parameters={parameters} phenomena={phenomena} />);
    expect(_component.type()).to.eql(AirmetsCategory);
  });

  it('shallow renders a ReactStrap Card', () => {
    const parameters = {
      location_indicator_mwo: 'EHDB',
      active_firs: ['EHAA'],
      firareas: { EHAA: {} }
    };
    const phenomena = [{
      code: 'OCNL_TSGR',
      layerpreset: 'airmet_layer_TS',
      name: 'Occasional thunderstorms with hail'
    }];
    const _component = shallow(<AirmetsCategory airmets={[]} parameters={parameters} phenomena={phenomena} />);
    expect(_component.type()).to.eql(Card);
  });
});
