import dispatch from './TafReducers';
import { LOCAL_ACTIONS } from './TafActions';
import moment from 'moment';
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
  it('should handle updateTimestamps', () => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        timestamps: {}
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.updateTimestampsAction(), container);
    expect(container.state).to.be.a('object');
    expect(container.state.timestamps).to.to.have.property('current');
    expect(moment.isMoment(container.state.timestamps.current)).to.eql(true);
    expect(container.state.timestamps).to.to.have.property('next');
    expect(moment.isMoment(container.state.timestamps.next)).to.eql(true);
  });
  it('should handle updateLocationsAction', (done) => {
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
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
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
  });
  it('should handle updateTimestamps with same locations and selectableTafs', () => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        timestamps: {},
        locations: ['EHAM'],
        selectableTafs: [{
          location: 'EHAM',
          timestamp: moment.utc(),
          label: {
            time: '12:00',
            text: 'EHAM 12:00',
            icon: 'test'
          },
          taf: {}
        }]
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.updateTimestampsAction(), container);
    expect(container.state).to.be.a('object');
    expect(container.state.timestamps).to.to.have.property('current');
    expect(moment.isMoment(container.state.timestamps.current)).to.eql(true);
    expect(container.state.timestamps).to.to.have.property('next');
    expect(moment.isMoment(container.state.timestamps.next)).to.eql(true);
  });
});
