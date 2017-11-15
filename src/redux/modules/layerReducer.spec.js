import layerReducer from './layerReducer';

describe('(Redux Module) layerReducer', () => {
  describe('(Reducer)', () => {
    const STATE = {
      wmjsLayers: {},
      baselayer: {
        service: 'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?',
        name: 'streetmap',
        title: 'OpenStreetMap',
        type: 'twms', // Can be either wms or twms
        format: 'image/gif',
        enabled: true
      },
      panels: [
        {
          overlays: [],
          layers: [],
          type: 'ADAGUC'
        },
        {
          overlays: [],
          layers: [],
          type: 'ADAGUC'
        },
        {
          overlays: [],
          layers: [],
          type: 'ADAGUC'
        },
        {
          overlays: [],
          layers: [],
          type: 'ADAGUC'
        }
      ]
    };
    it('Should be a function.', () => {
      expect(layerReducer).to.be.a('function');
    });

    it('Should initialize with an empty state.', () => {
      expect(layerReducer(undefined, [])).to.eql(STATE);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = layerReducer(undefined, []);
      expect(state).to.eql(STATE);
      state = layerReducer(state, { type: '@@@@@@@' });
      expect(state).to.eql(STATE);
    });
  });
});
