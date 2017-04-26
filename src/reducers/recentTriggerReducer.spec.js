import recentTriggerReducer, { types } from './recentTriggerReducer';
import moment from 'moment';

describe('(Redux Module) recentTriggerReducer', () => {
  describe('(Reducer)', () => {
    it('Should be a function.', () => {
      expect(recentTriggerReducer).to.be.a('function');
    });

    it('Should initialize with an empty state.', () => {
      expect(recentTriggerReducer(undefined, [])).to.eql([]);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = recentTriggerReducer(undefined, []);
      expect(state).to.eql([]);
      state = recentTriggerReducer(state, { type: '@@@@@@@' });
      expect(state).to.eql([]);
    });

    it('Can add a new notification.', () => {
      const notification = {
        type: types.ADD_NOTIFICATION,
        payload: {
          raw: {
            name: 'asdf',
            issuedate: moment()
          }
        }
      };

      const newState = recentTriggerReducer([], notification);
      expect(newState).to.have.length(1);
      expect(newState[0]).to.have.property('name');
      expect(newState[0].name).to.equal('asdf');
      expect(newState[0]).to.have.property('discarded');
      expect(newState[0].discarded).to.be.false();
    });

    it('Can remove a notification by UUID.', () => {
      const notification = {
        name: 'asdf',
        issuedate: moment(),
        uuid: '0f9cc5bc-71fd-4da2-afa0-7c8cd71ba325',
        discarded: false
      };

      const noneRemoved = {
        type: types.REMOVE_NOTIFICATION,
        payload: 'a19aadb2-c698-40b7-94c9-2ea89e9bbf6b'
      };
      const oneRemoved = {
        type: types.REMOVE_NOTIFICATION,
        payload: '0f9cc5bc-71fd-4da2-afa0-7c8cd71ba325'
      };

      const newState = recentTriggerReducer([notification], noneRemoved);
      expect(newState).to.have.length(1);
      expect(newState[0]).to.have.property('uuid');
      expect(newState[0].uuid).to.equal('0f9cc5bc-71fd-4da2-afa0-7c8cd71ba325');
      expect(newState[0]).to.have.property('discarded');
      expect(newState[0].discarded).to.be.false();
      const emptyState = recentTriggerReducer([notification], oneRemoved);
      expect(emptyState).to.have.length(1);
      expect(emptyState[0]).to.have.property('uuid');
      expect(emptyState[0].uuid).to.equal('0f9cc5bc-71fd-4da2-afa0-7c8cd71ba325');
      expect(emptyState[0]).to.have.property('discarded');
      expect(emptyState[0].discarded).to.be.true();
    });
  });
});
