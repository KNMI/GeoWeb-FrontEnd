import React from 'react';
import { default as LayerManager } from './LayerManager';
import { shallow, mount } from 'enzyme';
import { Col } from 'reactstrap';

describe('(Component) LayerManager', () => {
  let _wmjslayers;
  const emptyFunc = () => { /* intentionally left empty */ };
  const empytObj = { /* intentionally left empty */ };
  beforeEach(() => {
    _wmjslayers = {
      layers: [
        {
          autoupdate: true,
          timer: 425,
          service: 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
          WMJSService: {
            service: 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
            title: 'RADNL_OPER_R___25PCPRR_L3_WMS',
            onlineresource: 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&',
            abstract: `Radar precipitation measurements above the Netherlands, on a 1.0x1.0 km grid,
            measurements are available in a five minute time interval. The intensity is in kg/m2/hour (mm/hour).
            The dataset is created from KNMI RAD_NL25_PCP_NA files. For interoperability, the original unit reflectivity in DBZ is converted to precipitation flux in kg/m2/h.
            The conversion from dbZ to kg/m2/h is applied with the formula R = 10^((PixelValue -109)/32).`,
            version: '1.3.0',
            busy: false
          },
          getmapURL: 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&',
          getfeatureinfoURL: 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&',
          getlegendgraphicURL: 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
          keepOnTop: false,
          transparent: true,
          hasError: false,
          legendIsDimensionDependant: true,
          wms130bboxcompatibilitymode: false,
          version: '1.3.0',
          path: '',
          name: 'RADNL_OPER_R___25PCPRR_L3_COLOR',
          title: 'RADNL_OPER_R___25PCPRR_L3_COLOR',
          abstract: 'Not available',
          dimensions: [
            {
              name: 'time',
              units: 'ISO8601',
              values: '2009-03-27T13:50:00Z/2017-03-21T15:00:00Z/PT5M',
              currentValue: '2017-03-21T15:00:00Z',
              defaultValue: '2017-03-21T15:00:00Z',
              parentLayer: '[CIRCULAR]',
              linked: true
            }
          ],
          legendGraphic: `http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&&version=1.1.1&service=WMS&
          request=GetLegendGraphic&layer=RADNL_OPER_R___25PCPRR_L3_COLOR&format=image/png&STYLE=default`,
          queryable: true,
          enabled: true,
          styles: [
            {
              Title: {
                value: 'default'
              },
              LegendURL: {
                attr: {
                  height: '600',
                  width: '300'
                },
                OnlineResource: {
                  attr: {
                    'xlink:href': `http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&&version=1.1.1&service=WMS&
                    request=GetLegendGraphic&layer=RADNL_OPER_R___25PCPRR_L3_COLOR&format=image/png&STYLE=default`,
                    'xlink:type': 'simple'
                  }
                },
                Format: {
                  value: 'image/png'
                }
              },
              Name: {
                value: 'default'
              },
              index: 0,
              nrOfStyles: 1,
              title: 'default',
              name: 'default',
              legendURL: `http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&&version=1.1.1&service=WMS&
              request=GetLegendGraphic&layer=RADNL_OPER_R___25PCPRR_L3_COLOR&format=image/png&STYLE=default`,
              abstracttext: 'No abstract available'
            }
          ],
          currentStyle: 'default',
          id: -1,
          opacity: 1,
          image: {
            srcToLoad: `http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&&SERVICE=WMS&
            VERSION=1.3.0&REQUEST=GetMap&LAYERS=RADNL_OPER_R___25PCPRR_L3_COLOR&WIDTH=1768&HEIGHT=737&CRS=EPSG%3A3857&
            BBOX=-259803.8547948551,6470493.345653814,1434240.4603051045,7176664.533565958&STYLES=default&FORMAT=image/png&TRANSPARENT=TRUE&&time=2017-03-21T15%3A00%3A00Z`,
            KVP: [],
            imageLife: 22,
            loadThisOne: false
          },
          serviceTitle: 'RADNL_OPER_R___25PCPRR_L3_WMS',
          format: 'image/png',
          jsonlayer: '[CIRCULAR]'
        }
      ],
      baselayers: [
        {
          autoupdate: false,
          service: 'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?',
          getmapURL: 'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?',
          getfeatureinfoURL: 'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?',
          getlegendgraphicURL: 'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?',
          keepOnTop: false,
          transparent: true,
          hasError: false,
          legendIsDimensionDependant: true,
          wms130bboxcompatibilitymode: false,
          version: '1.1.1',
          path: '',
          objectpath: [],
          name: 'streetmap',
          title: 'OpenStreetMap',
          abstract: 'Not available',
          dimensions: [],
          legendGraphic: '',
          projectionProperties: [],
          queryable: false,
          enabled: true,
          currentStyle: '',
          id: -1,
          opacity: 1,
          serviceTitle: 'not defined',
          parentMaps: [],
          format: 'image/gif'
        },
        {
          autoupdate: false,
          service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
          getmapURL: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
          getfeatureinfoURL: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
          getlegendgraphicURL: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
          keepOnTop: true,
          transparent: true,
          hasError: false,
          legendIsDimensionDependant: true,
          wms130bboxcompatibilitymode: false,
          version: '1.1.1',
          path: '',
          objectpath: [],
          name: 'FIR_DEC_2013_EU',
          title: 'OVL',
          abstract: 'Not available',
          dimensions: [],
          legendGraphic: '',
          projectionProperties: [],
          queryable: false,
          enabled: true,
          currentStyle: '',
          id: -1,
          opacity: 1,
          serviceTitle: 'not defined',
          parentMaps: [],
          format: 'image/png'
        }
      ]
    };
  });
  it('Renders an empty div without layers', () => {
    const _component = mount(<LayerManager dispatch={emptyFunc} actions={empytObj} />);
    expect(_component.type()).to.eql(LayerManager);
  });

  it('Renders renders with layers', () => {
    const _component = shallow(<LayerManager dispatch={emptyFunc} actions={empytObj} wmjslayers={_wmjslayers} />);
    expect(_component.type()).to.eql(Col);
    const _deepComponent = mount(<LayerManager dispatch={emptyFunc} actions={empytObj} wmjslayers={_wmjslayers} />);
    expect(_deepComponent.type()).to.eql(LayerManager);

    expect(_deepComponent.state('layers')).to.have.lengthOf(1);
    expect(_deepComponent.state('baselayers')).to.have.lengthOf(1);
    expect(_deepComponent.state('overlays')).to.have.lengthOf(1);
  });
});
