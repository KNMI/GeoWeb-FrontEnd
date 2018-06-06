import React from 'react';
import { default as SigmetCategory } from './SigmetCategory_deprecated';
import { mount } from 'enzyme';
import moxios from 'moxios';
import { BACKEND_SERVER_URL } from '../../static/urls.json';

describe('(Container) SigmetCategory', () => {
  it('Renders a SigmetCategory', () => {
    const _component = mount(<SigmetCategory title={'test'} icon='star' urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    expect(_component.type()).to.eql(SigmetCategory);
  });
  it('Maps SIGMET phenomenon codes to Human Readable Text', () => {
    const phenomena = [
      { phenomenon: { name: 'Thunderstorm', code: 'TS', layerpreset: 'sigmet_layer_TS' },
        variants: [{ name: 'Obscured', code: 'OBSC' }, { name: 'Embedded', code: 'EMBD' }, { name: 'Frequent', code: 'FRQ' }, { name: 'Squall line', code: 'SQL' }],
        additions: [{ name: 'with hail', code: 'GR' }]
      },
      { phenomenon: { name: 'Turbulence', code: 'SEV_TURB', layerpreset: 'sigmet_layer_SEV_TURB' },
        variants: [],
        additions: []
      },
      { phenomenon: { name: 'Severe icing', code: 'SEV_ICE', layerpreset: 'sigmet_layer_SEV_ICE' },
        variants: [],
        additions: [{ name: 'due to freezing rain', code: 'FRZA' }]
      },
      { phenomenon: { name: 'Duststorm', code: 'HVY_DS', layerpreset: 'sigmet_layer_HVY_DS' },
        variants: [],
        additions: []
      },
      { phenomenon: { name: 'Sandstorm', code: 'HVY_SS', layerpreset: 'sigmet_layer_HVY_SS' },
        variants: [],
        additions: []
      },
      { phenomenon: { name: 'Radioactive cloud', code: 'RDOACT_CLD', layerpreset: 'sigmet_layer_RDOACT_CLD' },
        variants: [],
        additions: []
      }
    ];
    const _component = mount(<SigmetCategory title={'test'} icon='star' phenomenonMapping={phenomena} urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    const _instance = _component.instance();
    let phenomenon = _instance.getHRT4code();
    expect(phenomenon).to.eql('Unknown');
    phenomenon = _instance.getHRT4code(void 0);
    expect(phenomenon).to.eql('Unknown');
    phenomenon = _instance.getHRT4code('Test');
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
    expect(phenomenon).to.eql('Turbulence');
    phenomenon = _instance.getHRT4code('SEV_ICE');
    expect(phenomenon).to.eql('Severe icing');
    phenomenon = _instance.getHRT4code('SEV_ICE_(FRZA)');
    expect(phenomenon).to.eql('Severe icing due to freezing rain');
    phenomenon = _instance.getHRT4code('HVY_DS');
    expect(phenomenon).to.eql('Duststorm');
    phenomenon = _instance.getHRT4code('HVY_SS');
    expect(phenomenon).to.eql('Sandstorm');
    phenomenon = _instance.getHRT4code('RDOACT_CLD');
    expect(phenomenon).to.eql('Radioactive cloud');
    const _component2 = mount(<SigmetCategory title={'test'} icon='star' urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    const _instance2 = _component2.instance();
    phenomenon = _instance2.getHRT4code();
    expect(phenomenon).to.eql('Unknown');
  });
  it('Handles triggering of showLevels', () => {
    const _component = mount(<SigmetCategory title={'test'} icon='star' urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    const _instance = _component.instance();
    let phenomenon = _instance.showLevels({ });
    expect(phenomenon).to.eql('');
    phenomenon = _instance.showLevels({ lev1: { unit: 'SFC' } });
    expect(phenomenon).to.eql('');
    phenomenon = _instance.showLevels({ lev1: { unit: 'TOP' } });
    expect(phenomenon).to.eql('Tops at FLundefined');
    phenomenon = _instance.showLevels({ lev1: { unit: 'TOP', value: 100 } });
    expect(phenomenon).to.eql('Tops at FL100');
    phenomenon = _instance.showLevels({ lev1: { unit: 'TOP_ABV' } });
    expect(phenomenon).to.eql('Tops above FLundefined');
    phenomenon = _instance.showLevels({ lev1: { unit: 'TOP_ABV', value: 200 } });
    expect(phenomenon).to.eql('Tops above FL200');
    phenomenon = _instance.showLevels({ lev1: { unit: 'ABV' } });
    expect(phenomenon).to.eql('Above FLundefined');
    phenomenon = _instance.showLevels({ lev1: { unit: 'ABV', value: 300 } });
    expect(phenomenon).to.eql('Above FL300');
    /* phenomenon = _instance.showLevels({ lev1: { unit: 'SFC' }, lev2: {} });
    expect(phenomenon).to.eql('Between surface and ft');
    phenomenon = _instance.showLevels({ lev1: { unit: 'SFC' }, lev2: { unit: 'm' } });
    expect(phenomenon).to.eql('Between surface and ft');
    phenomenon = _instance.showLevels({ lev1: { unit: 'SFC' }, lev2: { unit: 'm' } });
    expect(phenomenon).to.eql('Between surface and ft'); */
  });
  // it('Handles triggering of tooltip', () => {
  //   const _component = mount(<SigmetCategory title={'test'} icon='star' />);
  //   const _instance = _component.instance();
  //   let phenomenon = _instance.tooltip(400, null);
  //   expect(phenomenon).to.eql('Above');
  //   phenomenon = _instance.tooltip(0, null);
  //   expect(phenomenon).to.eql('Surface');
  //   phenomenon = _instance.tooltip(100, 'm');
  //   expect(phenomenon).to.eql('3000 m');
  //   phenomenon = _instance.tooltip(100, 'ft');
  //   expect(phenomenon).to.eql('10000 ft');
  //   phenomenon = _instance.tooltip(100, 'FL');
  //   expect(phenomenon).to.eql('FL 100');
  // });
  // it('Handles triggering of marks', () => {
  //   const _component = mount(<SigmetCategory title={'test'} icon='star' />);
  //   const _instance = _component.instance();
  //   let phenomenon = _instance.marks([0, 100, 200], 'ft');
  //   expect(phenomenon).to.eql({ 0: '0 ft', 100: '10000 ft', 200: '20000 ft', 400: 'Above' });
  //   phenomenon = _instance.marks([0, 100, 200], 'FL');
  //   expect(phenomenon).to.eql({ 0: 'FL 0', 100: 'FL 100', 200: 'FL 200', 400: 'Above' });
  //   phenomenon = _instance.marks([100, 200, 300], 'FL');
  //   expect(phenomenon).to.eql({ 0: 'Surface', 100: 'FL 100', 200: 'FL 200', 300: 'FL 300', 400: 'Above' });
  // });
  it('Handles triggering of setSigmetLevel', () => {
    /* const _component = mount(<SigmetCategory title={'test'} icon='star' urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    const _instance = _component.instance();
    _instance.setSigmetLevel([]);
    _instance.setSigmetLevel([50]);
    _instance.setSigmetLevel([0, 100]); */
  });
  it('Allows to trigger a handleSigmetClick', () => {
    moxios.install();
    const sigmets = {
      sigmets: [
        {
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: []
                }
              }
            ]
          },
          phenomenon: 'SEV_ICE_FRZA',
          obs_or_forecast: {
            obs: false
          },
          level: {
            lev1: {
              value: 10,
              unit: 'FL'
            }
          },
          movement: {
            stationary: true
          },
          change: 'NC',
          forecast_position: '',
          issuedate: '2017-04-21T09:24:06Z',
          validdate: '2017-04-21T17:00:00Z',
          validdate_end: '2017-04-21T20:00:00Z',
          firname: 'AMSTERDAM FIR',
          location_indicator_icao: 'EHAA',
          location_indicator_mwo: 'EHDB',
          uuid: '2d151119-3bf0-445b-b2b8-e0a78f853867',
          status: 'PRODUCTION',
          sequence: 0
        }
      ]
    };
    let result;
    moxios.wait(() => {
      const request = moxios.stubRequest(`${BACKEND_SERVER_URL}/sigmet/getsigmetlist?active=false`);
      request.respondWith({
        status: 200,
        response: sigmets
      }).then(() => {
        const _component = mount(<SigmetCategory title={'test'} icon='star' urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
        expect(_component.find('.btn-group-vertical')).to.have.length(1);
        const _btnGroup = _component.find('.btn-group-vertical').get(0);
        expect(_btnGroup.find('.btn')).to.have.length(1);
        const _firstButton = _btnGroup.find('.btn').get(0);
        _firstButton.simulate('click');
        expect(result).to.eql(1);
        expect(false).to.equal(true);
        moxios.done();
        moxios.uninstall();
      }).catch((error) => {
        console.error('This test gave an error: ', error);
        expect(false).to.equal(true);
        moxios.done();
        moxios.uninstall();
      });
    });
  });
});
