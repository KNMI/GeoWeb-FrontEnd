import dispatch from './TafReducers';
import { LOCAL_ACTIONS, FEEDBACK_CATEGORIES, FEEDBACK_STATUSES, MODES } from './TafActions';
import { TIMESTAMP_FORMAT } from '../../components/Taf/TafTemplates';

import moment from 'moment';
import moxios from 'moxios';

describe('(Reducer) Taf/TafReducers', () => {
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
    expect(container.state.timestamps).to.have.property('current');
    expect(moment.isMoment(container.state.timestamps.current)).to.eql(true);
    expect(container.state.timestamps).to.have.property('next');
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
    expect(container.state.timestamps).to.have.property('current');
    expect(moment.isMoment(container.state.timestamps.current)).to.eql(true);
    expect(container.state.timestamps).to.have.property('next');
    expect(moment.isMoment(container.state.timestamps.next)).to.eql(true);
  });
  it('should handle editTaf', () => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        mode: MODES.EDIT
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.editTafAction(), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('mode', MODES.EDIT);
  });
  it('should handle discardTaf', () => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        mode: MODES.EDIT,
        selectedTaf: [{
          tafData: {
            prop: 'test'
          }
        }]
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.discardTafAction(), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('mode', MODES.EDIT);
    expect(container.state).to.have.property('selectedTaf');
    expect(container.state.selectedTaf).to.eql([]);
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
              { amount: null, height: 30, mod: 'CB' }
            ],
            vertical_visibility: null,
            visibility: { unit: null, value: null },
            weather: [],
            wind: {
              direction: null,
              gusts: null,
              gustsOperator: null,
              speed: null,
              speedOperator: null,
              unit: null
            },
            temperature: []
          }
        });
        done();
      }).catch(done);
    });
  });
  it('should handle copyTaf', () => {
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
          uuid: 'test-uuid',
          tafData: {}
        }],
        selectedTaf: [{
          location: 'EHAM',
          timestamp: moment.utc(),
          label: {
            time: '12:00',
            text: 'EHAM 12:00',
            icon: 'test'
          },
          uuid: 'test-uuid',
          tafData: {
            metadata: {
              uuid: 'test-uuid'
            }
          }
        }],
        copiedTafRef: null
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.copyTafAction(), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('copiedTafRef', 'test-uuid');
  });
  it('should handle pasteTaf', () => {
    const now = moment.utc();
    const taf = {
      location: 'EHAM',
      timestamp: moment.utc(),
      label: {
        time: '12:00',
        text: 'EHAM 12:00',
        icon: 'test'
      },
      uuid: 'test-uuid',
      tafData: {
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
          uuid: 'test-uuid',
          validityStart: now.clone().startOf('hour').format(TIMESTAMP_FORMAT),
          validityEnd: now.clone().startOf('hour').add(30, 'hour').format(TIMESTAMP_FORMAT)
        }
      }
    };
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'localhost'
        }
      },
      state: {
        timestamps: {},
        locations: ['EHAM'],
        selectableTafs: [taf],
        selectedTaf: [{
          hasEdits: false,
          tafData: {
            changegroups: [{ a: 'b' }]
          }
        }],
        copiedTafRef: 'test-uuid'
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.pasteTafAction(), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('copiedTafRef', null);
    expect(container.state).to.have.property('selectedTaf');
    expect(container.state.selectedTaf).to.be.a('array');
    expect(container.state.selectedTaf[0]).to.have.property('hasEdits', true);
    expect(container.state.selectedTaf[0]).to.have.property('tafData');
    expect(container.state.selectedTaf[0].tafData.forecast).to.eql(taf.tafData.forecast);
    expect(container.state.selectedTaf[0].tafData.changegroups).to.eql(taf.tafData.changegroups);
  });
  it('should handle selectTaf', () => {
    const now = moment.utc();
    const taf = {
      location: 'EHAM',
      timestamp: moment.utc(),
      label: {
        time: '12:00',
        text: 'EHAM 12:00',
        icon: 'test'
      },
      uuid: 'test-uuid',
      tafData: {
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
        forecast: { },
        metadata: {
          location: 'EHAM',
          status: 'concept',
          type: 'normal',
          validityStart: now.clone().startOf('hour').format(TIMESTAMP_FORMAT),
          validityEnd: now.clone().startOf('hour').add(30, 'hour').format(TIMESTAMP_FORMAT)
        }
      }
    };
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'localhost'
        }
      },
      state: {
        timestamps: {},
        locations: ['EHAM'],
        selectableTafs: [taf],
        selectedTaf: []
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.selectTafAction([taf]), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('selectedTaf');
    expect(container.state.selectedTaf).to.eql([taf]);
  });
  it('should handle selectTaf when same TAF is selected', () => {
    const now = moment.utc();
    const taf = {
      location: 'EHAM',
      timestamp: moment.utc(),
      label: {
        time: '12:00',
        text: 'EHAM 12:00',
        icon: 'test'
      },
      uuid: 'test-uuid',
      tafData: {
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
    };
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'localhost'
        }
      },
      state: {
        timestamps: {},
        locations: ['EHAM'],
        selectableTafs: [taf],
        selectedTaf: [taf]
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.selectTafAction([taf]), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('selectedTaf');
    expect(container.state.selectedTaf).to.eql([taf]);
  });
  it('should handle selectTaf when no selection is given', () => {
    const now = moment.utc();
    const taf = {
      location: 'EHAM',
      timestamp: moment.utc(),
      label: {
        time: '12:00',
        text: 'EHAM 12:00',
        icon: 'test'
      },
      uuid: 'test-uuid',
      tafData: {
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
    };
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'localhost'
        }
      },
      state: {
        timestamps: {},
        locations: ['EHAM'],
        selectableTafs: [taf],
        selectedTaf: [taf],
        feedback: {},
        mode: MODES.EDIT
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.selectTafAction([]), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('selectedTaf');
    expect(container.state.selectedTaf).to.eql([]);
  });
  it('should handle selectTaf when selection is not an array', () => {
    const now = moment.utc();
    const taf = {
      location: 'EHAM',
      timestamp: moment.utc(),
      label: {
        time: '12:00',
        text: 'EHAM 12:00',
        icon: 'test'
      },
      uuid: 'test-uuid',
      tafData: {
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
    };
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'localhost'
        }
      },
      state: {
        timestamps: {},
        locations: ['EHAM'],
        selectableTafs: [taf],
        selectedTaf: [taf],
        feedback: {},
        mode: MODES.EDIT
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.selectTafAction(null), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('selectedTaf');
    expect(container.state.selectedTaf).to.eql([taf]);
  });
  it('should handle updateFeedback', () => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'localhost'
        }
      },
      state: {
        timestamps: {},
        locations: ['EHAM'],
        selectableTafs: [],
        selectedTaf: [],
        feedback: {}
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.updateFeedbackAction('TitleTest', FEEDBACK_STATUSES.ERROR, FEEDBACK_CATEGORIES.LIFECYCLE, null, null), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('feedback');
    expect(container.state.feedback).to.have.property(FEEDBACK_CATEGORIES.LIFECYCLE);
    expect(container.state.feedback[FEEDBACK_CATEGORIES.LIFECYCLE]).to.eql({
      title: 'TitleTest',
      status: FEEDBACK_STATUSES.ERROR,
      subTitle: null,
      list: null
    });
  });
});
