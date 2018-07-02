import dispatch from './TafReducers';
import { LOCAL_ACTIONS } from './TafActions';
import { TIMESTAMP_FORMAT } from '../../components/Taf/TafTemplates';

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
          BACKEND_SERVER_URL: 'localhost'
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
          BACKEND_SERVER_URL: 'localhost'
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
  it('should handle updateTAFs, when no TAFs are responded', (done) => {
    const now = moment.utc();
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'localhost'
        }
      },
      state: {
        locations: ['EHAM'],
        timestamps : {
          current: now.clone().startOf('hour'),
          next: now.clone().startOf('hour').add(20, 'hour')
        },
        selectableTafs: [],
        selectedTaf: []
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.updateTafsAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {
          tafs: null,
          page: 0,
          npages: 1,
          ntafs: 0
        }
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state.selectableTafs).to.be.a('array');
        expect(container.state.selectableTafs.length).to.eql(2);
        expect(container.state.selectableTafs[0]).to.have.property('location', 'EHAM');
        expect(container.state.selectableTafs[0]).to.have.property('timestamp');
        expect(container.state.selectableTafs[0].timestamp.isSame(now.clone().startOf('hour'))).to.eql(true);
        expect(container.state.selectableTafs[0]).to.have.property('tafData');
        expect(container.state.selectableTafs[0].tafData).to.have.property('metadata');
        expect(container.state.selectableTafs[0].tafData.metadata).to.have.property('status', 'new');
        expect(container.state.selectableTafs[1]).to.have.property('location', 'EHAM');
        expect(container.state.selectableTafs[1]).to.have.property('timestamp');
        expect(container.state.selectableTafs[1].timestamp.isSame(now.clone().startOf('hour').add(20, 'hour'))).to.eql(true);
        expect(container.state.selectableTafs[1]).to.have.property('tafData');
        expect(container.state.selectableTafs[1].tafData).to.have.property('metadata');
        expect(container.state.selectableTafs[1].tafData.metadata).to.have.property('status', 'new');
        done();
      }).catch(done);
    });
  });
  it('should handle a basic updateTAFs', (done) => {
    const now = moment.utc();
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'localhost'
        }
      },
      state: {
        locations: ['EHAM', 'EHRD'],
        timestamps: {
          current: now.clone().startOf('hour'),
          next: now.clone().startOf('hour').add(6, 'hour')
        },
        selectableTafs: [],
        selectedTaf: []
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.updateTafsAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {
          tafs: [
            {
              changegroups: [],
              forecast: {},
              metadata: {
                location: 'EHAM',
                status: 'concept',
                type: 'normal',
                validityStart: now.clone().startOf('hour').format(TIMESTAMP_FORMAT),
                validityEnd: now.clone().startOf('hour').add(30, 'hour').format(TIMESTAMP_FORMAT)
              }
            },
            {
              changegroups: [],
              forecast: {},
              metadata: {
                location: 'EHAM',
                status: 'published',
                type: 'correction',
                validityStart: now.clone().startOf('hour').add(6, 'hour').format(TIMESTAMP_FORMAT),
                validityEnd: now.clone().startOf('hour').add(36, 'hour').format(TIMESTAMP_FORMAT)
              }
            }
          ],
          page: 0,
          npages: 1,
          ntafs: 2
        }
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state.selectableTafs).to.be.a('array');
        expect(container.state.selectableTafs.length).to.eql(4);
        expect(container.state.selectableTafs[0]).to.have.property('location', 'EHAM');
        expect(container.state.selectableTafs[0]).to.have.property('timestamp');
        expect(container.state.selectableTafs[0].timestamp.isSame(now.clone().startOf('hour'))).to.eql(true);
        expect(container.state.selectableTafs[0]).to.have.property('tafData');
        expect(container.state.selectableTafs[0].tafData).to.have.property('metadata');
        expect(container.state.selectableTafs[0].tafData.metadata).to.have.property('status', 'concept');
        expect(container.state.selectableTafs[0].tafData.metadata).to.have.property('type', 'normal');
        expect(container.state.selectableTafs[1]).to.have.property('location', 'EHAM');
        expect(container.state.selectableTafs[1]).to.have.property('timestamp');
        expect(container.state.selectableTafs[1].timestamp.isSame(now.clone().startOf('hour').add(6, 'hour'))).to.eql(true);
        expect(container.state.selectableTafs[1]).to.have.property('tafData');
        expect(container.state.selectableTafs[1].tafData).to.have.property('metadata');
        expect(container.state.selectableTafs[1].tafData.metadata).to.have.property('status', 'published');
        expect(container.state.selectableTafs[1].tafData.metadata).to.have.property('type', 'correction');
        expect(container.state.selectableTafs[2]).to.have.property('location', 'EHRD');
        expect(container.state.selectableTafs[2]).to.have.property('timestamp');
        expect(container.state.selectableTafs[2].timestamp.isSame(now.clone().startOf('hour'))).to.eql(true);
        expect(container.state.selectableTafs[2]).to.have.property('tafData');
        expect(container.state.selectableTafs[2].tafData).to.have.property('metadata');
        expect(container.state.selectableTafs[2].tafData.metadata).to.have.property('status', 'new');
        expect(container.state.selectableTafs[2].tafData.metadata).to.have.property('type', 'normal');
        expect(container.state.selectableTafs[3]).to.have.property('location', 'EHRD');
        expect(container.state.selectableTafs[3]).to.have.property('timestamp');
        expect(container.state.selectableTafs[3].timestamp.isSame(now.clone().startOf('hour').add(6, 'hour'))).to.eql(true);
        expect(container.state.selectableTafs[3]).to.have.property('tafData');
        expect(container.state.selectableTafs[3].tafData).to.have.property('metadata');
        expect(container.state.selectableTafs[3].tafData.metadata).to.have.property('status', 'new');
        expect(container.state.selectableTafs[3].tafData.metadata).to.have.property('type', 'normal');
        done();
      }).catch(done);
    });
  });
  it('should handle updateTAFs, with (missing) null properties', (done) => {
    const now = moment.utc();
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'localhost'
        }
      },
      state: {
        locations: ['EHAM'],
        timestamps: {
          current: now.clone().startOf('hour'),
          next: now.clone().startOf('hour').add(6, 'hour')
        },
        selectableTafs: [],
        selectedTaf: []
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.updateTafsAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {
          tafs: [
            {
              changegroups: [],
              forecast: {
                wind: {
                  direction: 120,
                  gusts: null,
                  gustsOperator: null,
                  speed: 20,
                  speedOperator: null,
                  unit: 'KT',
                  nonsense: null
                }
              },
              metadata: {
                location: 'EHAM',
                status: 'concept',
                type: 'normal',
                validityStart: now.clone().startOf('hour').format(TIMESTAMP_FORMAT),
                validityEnd: now.clone().startOf('hour').add(30, 'hour').format(TIMESTAMP_FORMAT)
              }
            },
            {
              changegroups: [],
              forecast: {
                wind: {
                  direction: 120,
                  speed: 20,
                  unit: 'KT',
                  nonsense: 'additional nonsense'
                }
              },
              metadata: {
                location: 'EHAM',
                status: 'published',
                type: 'correction',
                validityStart: now.clone().startOf('hour').add(6, 'hour').format(TIMESTAMP_FORMAT),
                validityEnd: now.clone().startOf('hour').add(36, 'hour').format(TIMESTAMP_FORMAT)
              }
            }
          ],
          page: 0,
          npages: 1,
          ntafs: 2
        }
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state.selectableTafs).to.be.a('array');
        expect(container.state.selectableTafs.length).to.eql(2);
        expect(container.state.selectableTafs[0].tafData).to.have.property('forecast');
        expect(container.state.selectableTafs[0].tafData.forecast).to.have.property('wind');
        expect(container.state.selectableTafs[0].tafData.forecast.wind).to.eql({
          direction: 120,
          gusts: null,
          gustsOperator: null,
          speed: 20,
          speedOperator: null,
          unit: 'KT'
        });
        expect(container.state.selectableTafs[1].tafData).to.have.property('forecast');
        expect(container.state.selectableTafs[1].tafData.forecast).to.have.property('wind');
        expect(container.state.selectableTafs[1].tafData.forecast.wind).to.eql({
          direction: 120,
          gusts: null,
          gustsOperator: null,
          speed: 20,
          speedOperator: null,
          unit: 'KT'
        });
        done();
      }).catch(done);
    });
  });
  it('should handle updateTAFs, with more nested properties', (done) => {
    const now = moment.utc();
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'localhost'
        }
      },
      state: {
        locations: ['EHAM'],
        timestamps: {
          current: now.clone().startOf('hour'),
          next: now.clone().startOf('hour').add(6, 'hour')
        },
        selectableTafs: [],
        selectedTaf: []
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.updateTafsAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {
          tafs: [
            {
              changegroups: [{
                forecast: {
                  clouds: [
                    {
                      amount: 'BKN',
                      height: 20
                    },
                    null,
                    {
                      height: 30,
                      mod: 'CB'
                    }
                  ]
                }
              }],
              forecast: {},
              metadata: {
                location: 'EHAM',
                status: 'concept',
                type: 'normal',
                validityStart: now.clone().startOf('hour').format(TIMESTAMP_FORMAT),
                validityEnd: now.clone().startOf('hour').add(30, 'hour').format(TIMESTAMP_FORMAT)
              }
            }
          ],
          page: 0,
          npages: 1,
          ntafs: 2
        }
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state.selectableTafs).to.be.a('array');
        expect(container.state.selectableTafs.length).to.eql(2);
        expect(container.state.selectableTafs[0].tafData).to.have.property('forecast');
        expect(container.state.selectableTafs[0].tafData.changegroups).to.be.a('array');
        expect(container.state.selectableTafs[0].tafData.changegroups.length).to.eql(1);
        expect(container.state.selectableTafs[0].tafData.changegroups[0]).to.eql({
          changeStart: null,
          changeEnd: null,
          changeType: null,
          forecast: {
            caVOK: false,
            clouds: [
              { amount: 'BKN', height: 20, mod: null },
              { amount: null, height: null, mod: null },
              { amount: null, height: 30, mod: 'CB' }
            ],
            vertical_visibility: null,
            visibility: { unit: null, value: null },
            weather: [{ descriptor: null, phenomena: [], qualifier: null }],
            wind: {
              direction: null,
              gusts: null,
              gustsOperator: null,
              speed: null,
              speedOperator: null,
              unit: null
            },
            temperature: [{ minimum: null, maximum: null }]
          }
        });
        done();
      }).catch(done);
    });
  });
});
