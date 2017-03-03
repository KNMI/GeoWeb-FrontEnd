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
      state = adagucReducer(state, { type: 'LOGIN', payload: 'asdf' });
      expect(state).to.eql({ loggedIn: true, username: 'asdf' });
      state = adagucReducer(state, { type: '@@@@@@@' });
      expect(state).to.eql({ loggedIn: true, username: 'asdf' });
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
        adagucProperties : { layers: { datalayers: [{ title: 'abc' }], overlays: [{ title: 'overlay' }] }, sources: {}, boundingBox: null, projectionName: 'EPSG:3857', mapCreated: false }
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
    it('Should remove only that layer from the state when called.', () => {
      const layerstate = _getStateSpy();
      expect(layerstate.adagucProperties.layers.datalayers).to.have.length(1);

      _dispatchSpy(actions.deleteLayer({ title: 'abc' }, 'data'));

      const newlayerstate = _getStateSpy();
      console.log(newlayerstate.adagucProperties.layers);
      expect(newlayerstate.adagucProperties.layers.datalayers).to.have.length(0);
      expect(newlayerstate.adagucProperties.layers.overlays).to.have.length(1);
    });
  });
  // describe('(Action Creator) doubleAsync', () => {
  //   let _globalState;
  //   let _dispatchSpy;
  //   let _getStateSpy;

  //   beforeEach(() => {
  //     _globalState = {
  //       counter : adagucReducer(undefined, {})
  //     };
  //     _dispatchSpy = sinon.spy((action) => {
  //       _globalState = {
  //         ..._globalState,
  //         counter : adagucReducer(_globalState.counter, action)
  //       };
  //     });
  //     _getStateSpy = sinon.spy(() => {
  //       return _globalState;
  //     });
  //   });

  //   it('Should be exported as a function.', () => {
  //     expect(doubleAsync).to.be.a('function');
  //   });

  //   it('Should return a function (is a thunk).', () => {
  //     expect(doubleAsync()).to.be.a('function');
  //   });

  //   it('Should return a promise from that thunk that gets fulfilled.', () => {
  //     return doubleAsync()(_dispatchSpy, _getStateSpy).should.be.fulfilled;
  //   });

  //   it('Should call dispatch and getState exactly once.', () => {
  //     return doubleAsync()(_dispatchSpy, _getStateSpy)
  //       .then(() => {
  //         _dispatchSpy.should.have.been.calledOnce;
  //         _getStateSpy.should.have.been.calledOnce;
  //       });
  //   });

  //   it('Should produce a state that is double the previous state.', () => {
  //     _globalState = { counter: 2 };

  //     return doubleAsync()(_dispatchSpy, _getStateSpy)
  //       .then(() => {
  //         _dispatchSpy.should.have.been.calledOnce;
  //         _getStateSpy.should.have.been.calledOnce;
  //         expect(_globalState.counter).to.equal(4);
  //         return doubleAsync()(_dispatchSpy, _getStateSpy);
  //       })
  //       .then(() => {
  //         _dispatchSpy.should.have.been.calledTwice;
  //         _getStateSpy.should.have.been.calledTwice;
  //         expect(_globalState.counter).to.equal(8);
  //       });
  //   });
  // });

  // // NOTE: if you have a more complex state, you will probably want to verify
  // // that you did not mutate the state. In this case our state is just a number
  // // (which cannot be mutated).
  // describe('(Action Handler) COUNTER_INCREMENT', () => {
  //   it('Should increment the state by the action payload\'s "value" property.', () => {
  //     let state = adagucReducer(undefined, {});
  //     expect(state).to.equal(0);
  //     state = adagucReducer(state, increment(1));
  //     expect(state).to.equal(1);
  //     state = adagucReducer(state, increment(2));
  //     expect(state).to.equal(3);
  //     state = adagucReducer(state, increment(-3));
  //     expect(state).to.equal(0);
  //   });
  // });
});
