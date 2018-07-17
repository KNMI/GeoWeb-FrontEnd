import React from 'react';
import { default as LocationManagementPanel, LocationMapper } from './LocationManagementPanel';
import { mount, shallow } from 'enzyme';
import moxios from 'moxios';

describe('(Component) LocationManagementPanel', () => {
  let _component,
    _deepComponent;
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('Renders a LocationMapper', (done) => {
    _component = shallow(<LocationManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        expect(_component.type()).to.eql(LocationMapper);
        done();
      }).catch(done);
    });
  });
  it('Renders the EHAM card', (done) => {
    _deepComponent = mount(<LocationManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        const cards = _deepComponent.find('.card');
        const firstCard = cards.first();
        const title = firstCard.find('.card-title').first();
        expect(title.text()).to.equal('EHAM');
        done();
      }).catch(done);
    });
  });
  it('Can edit a card', (done) => {
    _deepComponent = mount(<LocationManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        const cards = _deepComponent.find('.card');
        const firstCard = cards.first();
        const editButton = firstCard.find('.fa-pencil').first();
        editButton.simulate('click');
        const titleInput = _deepComponent.find('.card').first().find('#nameinput0');
        expect(titleInput).to.exist();
        done();
      }).catch(done);
    });
  });
});
