import {
  SET_SOURCE,
  actions,
  default as adagucReducer
} from 'routes/ADAGUC/modules/adaguc';

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
      state = adagucReducer(state, { type: 'SET_STYLES', payload: 'asdf' });
      expect(state).to.eql({ styles: 'asdf' });
      state = adagucReducer(state, { type: '@@@@@@@' });
      expect(state).to.eql({ styles: 'asdf' });
    });
  });

  describe('(Action Creator) setSource', () => {
    it('Should be exported as a function.', () => {
      expect(actions).to.have.property('setSource');
      expect(actions.setSource).to.be.a('function');
    });

    it('Should return an action with type "SET_SOURCE".', () => {
      expect(actions.setSource()).to.have.property('type', SET_SOURCE);
    });

    it('Should assign the first argument to the "payload" property.', () => {
      expect(actions.setSource(5)).to.have.property('payload', 5);
    });

    it('Should default the "payload" property to 0 if not provided.', () => {
      expect(actions.setSource()).to.have.property('payload', 0);
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
