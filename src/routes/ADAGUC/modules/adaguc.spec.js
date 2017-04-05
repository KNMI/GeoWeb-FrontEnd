import {
  actions,
  default as adagucReducer
} from 'routes/ADAGUC/modules/adaguc';
import sinon from 'sinon';

describe('(Redux Module) Adaguc', () => {
  describe('(Reducer)', () => {
    it('Should be a function.', () => {
      expect(adagucReducer).to.be.a('function');
    });

    it('Should initialize with an empty state.', () => {
      expect(adagucReducer(undefined, {})).to.eql({});
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = adagucReducer(undefined, {});
      expect(state).to.eql({});
      state = adagucReducer(state, { type: '@@@@@@@' });
      expect(state).to.eql({});
    });

    it('Check if sign in and sign out actions work.', () => {
      let state = adagucReducer(undefined, {});
      state = adagucReducer(state, { type: 'LOGIN', payload: { userName:'asdf', roles:[] } });
      console.log(state);
      expect(state).to.eql({ user: { isLoggedIn: true, userName: 'asdf', roles: [] } });
      state = adagucReducer(state, { type: '@@@@@@@' });
      expect(state).to.eql({ user: { isLoggedIn: true, userName: 'asdf', roles: [] } });
      state = adagucReducer(state, { type: 'LOGOUT', payload: '' });
      expect(state).to.eql({ user: { isLoggedIn: false, userName: '', roles: [] } });
    });
  });

  describe('(Action Creator) setCut', () => {
    it('Should be exported as a function.', () => {
      expect(actions).to.have.property('setCut');
      expect(actions.setCut).to.be.a('function');
    });

    it('Should return an action with type "SET_CUT".', () => {
      expect(actions.setCut()).to.have.property('type', 'SET_CUT');
    });

    it('Should assign the first argument to the "payload" property.', () => {
      expect(actions.setCut(5)).to.have.property('payload', 5);
    });

    it('Should default the "payload" property to NL bounding box if not provided.', () => {
      const cut = actions.setCut();
      expect(cut).to.have.property('payload');
      expect(cut.payload.title).to.equal('Netherlands');
    });

    it('Should set the map state to have that bounding box', () => {
      let _globalState = { adagucProperties: { } };
      let _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          adagucProperties : adagucReducer(_globalState.adagucProperties, action)
        };
      });
      _dispatchSpy(actions.setCut());
      expect(_globalState.adagucProperties.boundingBox.title).to.equal('Netherlands');
    });
  });

  describe('(Action Handler) prepareSIGMET', () => {
    let _globalState;
    let _dispatchSpy;
    let _getStateSpy;

    beforeEach(() => {
      _globalState = {
        adagucProperties : { layers: {}, sources: {}, boundingBox: null, projectionName: 'EPSG:3857', mapCreated: false }
      };
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          adagucProperties : adagucReducer(_globalState.adagucProperties, action)
        };
      });
      _getStateSpy = sinon.spy(() => {
        return _globalState;
      });
    });

    it('SIGMET state should contain only the FIR overlay.', () => {
      _dispatchSpy(actions.prepareSIGMET('OBSC TS'));
      const sigmetState = _getStateSpy();
      expect(sigmetState.adagucProperties.layers.overlays).to.have.length(1);
      const overlay = sigmetState.adagucProperties.layers.overlays[0];
      expect(overlay.label).to.equal('FIR areas');
    });

    it('SIGMET state should contain a lightning layer.', () => {
      _dispatchSpy(actions.prepareSIGMET('OBSC TS'));
      const sigmetState = _getStateSpy();
      expect(sigmetState.adagucProperties.layers.datalayers).to.have.length.of.at.least(1);
      const lightningLayer = sigmetState.adagucProperties.layers.datalayers.filter((layer) => layer.title === 'LGT');
      expect(lightningLayer).to.have.length.of.at.least(1);
    });
  });

  describe('(Action Handler) addLayer', () => {
    let _globalState;
    let _dispatchSpy;
    let _getStateSpy;

    beforeEach(() => {
      _globalState = {
        adagucProperties : adagucReducer(undefined, {})
      };
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          adagucProperties : adagucReducer(_globalState.adagucProperties, action)
        };
      });
      _getStateSpy = sinon.spy(() => {
        return _globalState;
      });
    });

    it('Should call dispatch and getState exactly once.', () => {
      actions.addLayer(_dispatchSpy, _getStateSpy);
      _dispatchSpy.should.have.been.calledOnce;
      _getStateSpy.should.have.been.calledOnce;
    });
  });

  describe('(Action creator) deleteLayer', () => {
    let _globalState;
    let _dispatchSpy;
    let _getStateSpy;

    beforeEach(() => {
      _globalState = {
        adagucProperties : {
          layers: {
            panel: [
            { datalayers: [{ title: 'abc' }], overlays: [{ title: 'overlay' }] }
            ]
          },
          sources: {},
          boundingBox: null,
          projectionName: 'EPSG:3857',
          mapCreated: false,
          activeMapId: 0
        }
      };
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          adagucProperties : adagucReducer(_globalState.adagucProperties, action)
        };
      });
      _getStateSpy = sinon.spy(() => {
        return _globalState;
      });
    });

    it('Should call dispatch and getState exactly once.', () => {
      actions.deleteLayer(_dispatchSpy, _getStateSpy);
      _dispatchSpy.should.have.been.calledOnce;
      _getStateSpy.should.have.been.calledOnce;
    });
    it('Should remove nothing when an unknown layer is attempted to be deleted.', () => {
      const layerstate = _getStateSpy();
      expect(layerstate.adagucProperties.layers.panel[0].datalayers).to.have.length(1);
      expect(layerstate.adagucProperties.layers.panel[0].overlays).to.have.length(1);
      _dispatchSpy(actions.deleteLayer(0, '@@@@'));
      const newlayerstate = _getStateSpy();
      expect(newlayerstate.adagucProperties.layers.panel[0].datalayers).to.have.length(1);
      expect(newlayerstate.adagucProperties.layers.panel[0].overlays).to.have.length(1);
    });
    it('Should remove only a datalayer from the state when called.', () => {
      const layerstate = _getStateSpy();
      expect(layerstate.adagucProperties.layers.panel[0].datalayers).to.have.length(1);
      expect(layerstate.adagucProperties.layers.panel[0].overlays).to.have.length(1);

      _dispatchSpy(actions.deleteLayer(0, 'data'));

      const newlayerstate = _getStateSpy();
      expect(newlayerstate.adagucProperties.layers.panel[0].datalayers).to.have.length(0);
      expect(newlayerstate.adagucProperties.layers.panel[0].overlays).to.have.length(1);
    });
    it('Should remove only an overlay layer from the state when called.', () => {
      const layerstate = _getStateSpy();
      expect(layerstate.adagucProperties.layers.panel[0].datalayers).to.have.length(1);
      expect(layerstate.adagucProperties.layers.panel[0].overlays).to.have.length(1);

      _dispatchSpy(actions.deleteLayer(0, 'overlay'));

      const newlayerstate = _getStateSpy();
      expect(newlayerstate.adagucProperties.layers.panel[0].datalayers).to.have.length(1);
      expect(newlayerstate.adagucProperties.layers.panel[0].overlays).to.have.length(0);
    });
  });

  describe('(Action creator) reorderLayer', () => {
    let _globalState;
    let _dispatchSpy;
    let _getStateSpy;

    beforeEach(() => {
      _globalState = {
        adagucProperties : {
          layers: {
            panel: [
              {
                datalayers: [
                { title: 'abc' },
                { title: 'def' }
                ],
                overlays:
                [{ title: 'overlay' }]
              }
            ]
          },
          sources: {},
          boundingBox: null,
          projectionName: 'EPSG:3857',
          mapCreated: false,
          activeMapId: 0
        }
      };
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          adagucProperties : adagucReducer(_globalState.adagucProperties, action)
        };
      });
      _getStateSpy = sinon.spy(() => {
        return _globalState;
      });
    });

    it('Reordering layers should work.', () => {
      const layerstate = _getStateSpy();
      expect(layerstate.adagucProperties.layers.panel[0].datalayers).to.have.length(2);
      expect(layerstate.adagucProperties.layers.panel[0].datalayers[0].title).to.eql('abc');
      expect(layerstate.adagucProperties.layers.panel[0].overlays).to.have.length(1);

      _dispatchSpy(actions.reorderLayer('down', 0));

      const newlayerstate = _getStateSpy();
      expect(newlayerstate.adagucProperties.layers.panel[0].datalayers).to.have.length(2);
      expect(newlayerstate.adagucProperties.layers.panel[0].datalayers[0].title).to.eql('def');
      expect(newlayerstate.adagucProperties.layers.panel[0].overlays).to.have.length(1);
    });
  });
});
