import dispatch from './TafReducers';
import { LOCAL_ACTIONS } from './TafActions';
import moxios from 'moxios';

describe('(Reducer) TafReducers', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('should be a function', () => {
    expect(dispatch).to.be.a('function');
  });
  /* it('should handle updateLocationsAction', (done) => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        locations: []
      }
    };
    dispatch(LOCAL_ACTIONS.updateLocationsAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {
          payload: [{ name: 'EHAM', availability: ['taf'] }],
          message: 'ok'
        }
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state.locations).to.eql(['EHAM']);
        done();
      }).catch(done);
    });
  }); */
});
