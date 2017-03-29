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
    const _instance = _component.instance();
    let phenomenon = _instance.getHRT4code('Test');
    expect(phenomenon).to.eql('Unknown');
    phenomenon = _instance.getHRT4code('OBSC_TS');
    expect(phenomenon).to.eql('Obscured thunderstorm');
    phenomenon = _instance.getHRT4code('EMBD_TS');
    expect(phenomenon).to.eql('Embedded thunderstorm');
    phenomenon = _instance.getHRT4code('FRQ_TS');
    expect(phenomenon).to.eql('Frequent thunderstorm');
    phenomenon = _instance.getHRT4code('SQL_TS');
    expect(phenomenon).to.eql('Squall line thunderstorm');
    phenomenon = _instance.getHRT4code('OBSC_TSGR');
    expect(phenomenon).to.eql('Obscured thunderstorm with hail');
    phenomenon = _instance.getHRT4code('EMBD_TSGR');
    expect(phenomenon).to.eql('Embedded thunderstorm with hail');
    phenomenon = _instance.getHRT4code('FRQ_TSGR');
    expect(phenomenon).to.eql('Frequent thunderstorm with hail');
    phenomenon = _instance.getHRT4code('SQL_TSGR');
    expect(phenomenon).to.eql('Squall line thunderstorm with hail');
    phenomenon = _instance.getHRT4code('SEV_TURB');
    expect(phenomenon).to.eql('Severe turbulence');
    phenomenon = _instance.getHRT4code('SEV_ICE');
    expect(phenomenon).to.eql('Severe icing');
    phenomenon = _instance.getHRT4code('SEV_ICE_(FZRA)');
    expect(phenomenon).to.eql('Severe icing due to freezing rain');
    phenomenon = _instance.getHRT4code('HVY_DS');
    expect(phenomenon).to.eql('Heavy duststorm');
    phenomenon = _instance.getHRT4code('HVY_SS');
    expect(phenomenon).to.eql('Heavy sandstorm');
    phenomenon = _instance.getHRT4code('RDOACT_CLD');
    expect(phenomenon).to.eql('Radioactive cloud');
  });
});
