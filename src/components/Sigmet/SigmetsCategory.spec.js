import React from 'react';
import SigmetsCategory from './SigmetsCategory';
import { mount, shallow } from 'enzyme';
import { Card } from 'reactstrap';

describe('(Component) SigmetsCategory', () => {
  it('mount renders a SigmetsCategory', () => {
    const parameters = {
      location_indicator_mwo: 'EHDB',
      active_firs: ['EHAA'],
      firareas: { EHAA: {} }
    };
    const phenomena = [{
      code: 'OBSC_TSGR',
      layerpreset: 'sigmet_layer_TS',
      name: 'Obscured thunderstorm with hail'
    }];
    const _component = mount(<SigmetsCategory sigmets={[]} parameters={parameters} phenomena={phenomena} />);
    expect(_component.type()).to.eql(SigmetsCategory);
  });

  it('shallow renders a ReactStrap Card', () => {
    const parameters = {
      location_indicator_mwo: 'EHDB',
      active_firs: ['EHAA'],
      firareas: { EHAA: {} }
    };
    const phenomena = [{
      code: 'OBSC_TSGR',
      layerpreset: 'sigmet_layer_TS',
      name: 'Obscured thunderstorm with hail'
    }];
    const _component = shallow(<SigmetsCategory sigmets={[]} parameters={parameters} phenomena={phenomena} />);
    expect(_component.type()).to.eql(Card);
  });
});
