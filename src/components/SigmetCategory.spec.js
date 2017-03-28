import React from 'react';
import { default as SigmetCategory } from './SigmetCategory';
import { mount } from 'enzyme';

describe('(Container) SigmetCategory', () => {
  it('Renders a SigmetCategory', () => {
    const _component = mount(<SigmetCategory title={'test'} icon='star' />);
    expect(_component.type()).to.eql(SigmetCategory);
  });
  it('Maps SIGMET phenomenon codes to Human Readable Text', () => {
    const _component = mount(<SigmetCategory title={'test'} icon='star' />);
    const obscureThunderstorm = _component.instance().getHRT4code('OBSC_TS');
    expect(obscureThunderstorm).to.eql('Obscured thunderstorm');
  });
});
