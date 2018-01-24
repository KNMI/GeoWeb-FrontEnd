import cloneDeep from 'lodash.clonedeep';
import layerReducer from './layerReducer';

describe('(Redux Module) layerReducer', () => {
  describe('(Reducer)', () => {
    const STATE = {
      wmjsLayers: {
        layers: [],
        baselayers: []
      },
      baselayer: {
        name: 'OSM',
        title: 'OpenStreetMap',
        type: 'twms', // Can be either wms or twms
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
    const ALT_STATE = cloneDeep(STATE);
    ALT_STATE.panels[1].layers = [
      { index: 0 },
      { index: 1 },
      { index: 2 }
    ];

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

    it('Handles the set active layer action', () => {
      const setActiveLayer = {
        type: 'SET_ACTIVE_LAYER',
        payload: {
          activeMapId: 1,
          layerClicked: 2
        }
      };
      const newState = layerReducer(ALT_STATE, setActiveLayer);
      expect(newState.panels[0]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[2]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[3]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState).to.have.nested.property('panels[1].layers[0].active', false);
      expect(newState).to.have.nested.property('panels[1].layers[1].active', false);
      expect(newState).to.have.nested.property('panels[1].layers[2].active', true);
    });

    it('Handles the set panel type action', () => {
      const setPanelType = {
        type: 'SET_PANEL_TYPE',
        payload: {
          mapId: 2,
          type: 'TEST'
        }
      };
      const newState = layerReducer(STATE, setPanelType);
      expect(newState.panels[0]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[1]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[3]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[2]).to.eql({
        overlays: [],
        layers: [],
        type: 'TEST'
      });
    });

    it('Handles the add layer action', () => {
      const addLayer = {
        type: 'ADD_LAYER',
        payload: {
          activeMapId: 3,
          layer: { enabled: true, active: true }
        }
      };
      const addLayer1 = {
        type: 'ADD_LAYER',
        payload: {
          activeMapId: 3,
          layer: { enabled: false, active: true }
        }
      };
      let newState = layerReducer(STATE, addLayer);
      expect(newState.panels[0]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[1]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[2]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[3]).to.eql({
        overlays: [],
        layers: [ { active: true, enabled: true } ],
        type: 'ADAGUC'
      });
      newState = layerReducer(STATE, addLayer1);
      expect(newState.panels[3]).to.eql({
        overlays: [],
        layers: [ { active: true, enabled: false } ],
        type: 'ADAGUC'
      });
    });

    it('Handles the add overlay layer action', () => {
      const addOverlayLayer = {
        type: 'ADD_OVERLAY_LAYER',
        payload: {
          activeMapId: 0,
          layer: { service: 'coolOverlayService', name: 'coolOverlayName' }
        }
      };
      let newState = layerReducer(STATE, addOverlayLayer);
      expect(newState.panels[0]).to.eql({
        overlays: [
          {
            name: 'coolOverlayName',
            service: 'coolOverlayService'
          }
        ],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[1]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[2]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
      expect(newState.panels[3]).to.eql({
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      });
    });
  });
});
