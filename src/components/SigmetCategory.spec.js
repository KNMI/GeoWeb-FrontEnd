import React from 'react';
import { default as SigmetCategory } from './SigmetCategory';
import { mount } from 'enzyme';
import moxios from 'moxios';

describe('(Container) SigmetCategory', () => {
  beforeEach(function () {
    // import and pass your custom axios instance to this method
    moxios.install();
  });

  afterEach(function () {
    // import and pass your custom axios instance to this method
    moxios.uninstall();
  });

  it('Renders a SigmetCategory', () => {
    const _component = mount(<SigmetCategory title={'test'} icon='star' />);
    expect(_component.type()).to.eql(SigmetCategory);
  });
  it('Maps SIGMET phenomenon codes to Human Readable Text', () => {
    const phenomena = [
      { 'phenomenon':{ 'name':'Thunderstorm', 'code':'TS', 'layerpreset':'sigmet_layer_TS' },
        'variants':[{ 'name':'Obscured', 'code':'OBSC' }, { 'name':'Embedded', 'code':'EMBD' }, { 'name':'Frequent', 'code':'FRQ' }, { 'name':'Squall line', 'code':'SQL' }],
        'additions':[{ 'name':'with hail', 'code':'GR' }]
      },
      { 'phenomenon':{ 'name':'Turbulence', 'code':'SEV_TURB', 'layerpreset':'sigmet_layer_SEV_TURB' },
        'variants':[],
        'additions':[]
      },
      { 'phenomenon':{ 'name':'Severe Icing', 'code':'SEV_ICE', 'layerpreset':'sigmet_layer_SEV_ICE' },
        'variants':[],
        'additions':[{ 'name':'due to freezing rain', 'code':'FRZA' }]
      },
      { 'phenomenon':{ 'name':'Duststorm', 'code':'DS', 'layerpreset':'sigmet_layer_DS' },
        'variants':[],
        'additions':[]
      },
      { 'phenomenon':{ 'name':'Sandstorm', 'code':'SS', 'layerpreset':'sigmet_layer_SS' },
        'variants':[],
        'additions':[]
      },
      { 'phenomenon':{ 'name':'Radioactive cloud', 'code':'RDOACT_CLD', 'layerpreset':'sigmet_layer_RDOACT_CLD' },
        'variants':[],
        'additions':[]
      }
    ];
    moxios.wait(function () {
      let request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: phenomena
      }).then(function () {
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
  });
});
