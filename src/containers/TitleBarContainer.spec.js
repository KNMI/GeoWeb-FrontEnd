import React from 'react';
import TitleBarContainer from './TitleBarContainer';
import { mount } from 'enzyme';
import sinon from 'sinon';
import moxios from 'moxios';

const moment = require('moment');

const emptyFunc = () => {
  // intentionally left blank
};
const emptyObj = {
  // intentionally left blank
};

describe('(Component) TitleBarContainer', () => {
  let _component;
  const _logoutaction = sinon.spy();
  const _loginaction = sinon.spy();
  beforeEach(() => {
    moxios.install();
    _component = mount(<TitleBarContainer urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} mapProperties={{ boundingBox: emptyObj, projection: emptyObj }}
      user={{ roles: [], isLoggedIn: false }} userActions={{ login: _loginaction, logout: _logoutaction }}
      adagucProperties={emptyObj} dispatch={emptyFunc} routes={[{ path: 'testpath' }]} triggerNotifications={[]} />);
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('Renders nested routes', (done) => {
    _component = mount(<TitleBarContainer urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
      userActions={{ login: _loginaction, logout: _logoutaction }}
      adagucProperties={emptyObj}
      mapProperties={{ boundingBox: emptyObj, projection: emptyObj }}
      dispatch={emptyFunc}
      user={{ roles: [], isLoggedIn: false }}
      routes={[
        { path: 'testpathA', indexRoute: { title: 'testpathAtitle' } },
        { path: 'testpathB', indexRoute: { title: 'testpathBtitle' } },
        { path: 'testpathC', indexRoute: { title: 'testpathCtitle' } }
      ]}
    />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        expect(_component.type()).to.eql(TitleBarContainer);
        done();
      }).catch(done);
    });
  });
  it('Renders a TitleBarContainer', (done) => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        expect(_component.type()).to.eql(TitleBarContainer);
        done();
      }).catch(done);
    });
  });
  it('Renders initially with the current time', (done) => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        const currentTime = moment.utc().format('ddd DD MMM YYYY HH:mm [UTC]').toString();
        expect(_component.state().currentTime).to.equal(currentTime);
        done();
      }).catch(done);
    });
  });
  it('Calls the login function when the login button is clicked', (done) => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        _component.doLogin = sinon.spy();
        _component.toggleLoginModal = sinon.spy();
        const loginComponent = _component.find('#loginIcon');
        expect(loginComponent.length).to.be.at.least(1); // enzyme v3++ doesn't dedupe anymore
        loginComponent.at(0).simulate('click');
        done();
      }).catch(done);
    });
  });

  it('Checks setLoggedOut method', (done) => {
    const _logoutaction = sinon.spy();
    _component = mount(
      <TitleBarContainer urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
        mapProperties={{ boundingBox: emptyObj, projection: emptyObj }}
        user={{ roles: [], isLoggedIn: false }} userActions={{ login: _loginaction, logout: _logoutaction }}
        adagucProperties={{ user: { isLoggedIn: true, userName: 'Blah' } }}
        dispatch={emptyFunc}
        routes={[{ path: 'testpath' }]}
      />
    );
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        _component.instance().setLoggedOutCallback('testmessage');
        expect(_component.state().loginModalMessage).to.equal('testmessage');
        expect(_component.instance().inputfieldUserName).to.equal('');
        expect(_component.instance().inputfieldPassword).to.equal('');
        _logoutaction.should.have.been.calledOnce();
        done();
      }).catch(done);
    });
  });

  it('Checks checkCredentialsOKCallback method with user test', (done) => {
    const _loginaction = sinon.spy();
    _component = mount(
      <TitleBarContainer urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
        mapProperties={{ boundingBox: emptyObj, projection: emptyObj }}
        user={{ roles: [], isLoggedIn: false }} userActions={{ login: _loginaction, logout: _logoutaction }}
        dispatch={emptyFunc}
        routes={[{ path: 'testpath' }]}
      />
    );
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        _component.instance().checkCredentialsOKCallback({ userName: 'test' });
        expect(_component.state().loginModal).to.equal(false);
        expect(_component.state().loginModalMessage).to.equal('Signed in as user test');
        _loginaction.should.have.been.calledOnce();
        done();
      }).catch(done);
    });
  });

  it('Checks checkCredentialsBadCallback', (done) => {
    const _logoutaction = sinon.spy();
    _component = mount(
      <TitleBarContainer urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
        mapProperties={{ boundingBox: emptyObj, projection: emptyObj }}
        user={{ roles: [], isLoggedIn: false }} userActions={{ login: _loginaction, logout: _logoutaction }}
        dispatch={emptyFunc}
        routes={[{ path: 'testpath' }]}
      />
    );
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        _component.instance().checkCredentialsBadCallback({
          response: {
            data: {
              message: 'invalid_user'
            }
          }
        });
        expect(_component.state().loginModalMessage).to.equal('invalid_user');
        _logoutaction.should.have.been.calledOnce();
        done();
      }).catch(done);
    });
  });

  it('Checks checkCredentialsOKCallback method with invalid username \'\' ', (done) => {
    _component = mount(
      <TitleBarContainer urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
        mapProperties={{ boundingBox: emptyObj, projection: emptyObj }}
        user={{ roles: [], isLoggedIn: false }} userActions={{ login: _loginaction, logout: _logoutaction }}
        dispatch={emptyFunc}
        routes={[{ path: 'testpath' }]}
      />
    );
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        _component.instance().inputfieldUserName = 'someuser';
        _component.instance().checkCredentialsOKCallback({ userName: '' });
        expect(_component.state().loginModalMessage).to.equal('Unauthorized');
        done();
      }).catch(done);
    });
  });

  it('Checks if logout method works and if logout action is triggered once', (done) => {
    const _logoutaction = sinon.spy();
    _component = mount(
      <TitleBarContainer urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
        mapProperties={{ boundingBox: emptyObj, projection: emptyObj }}
        user={{ roles: [], isLoggedIn: false }} userActions={{ login: _loginaction, logout: _logoutaction }}
        adagucProperties={{ user: { isLoggedIn: true, userName: 'Blah' } }}
        dispatch={emptyFunc}
        routes={[{ path: 'testpath' }]}
      />
    );
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        _component.instance().doLogout();
        expect(_component.instance().inputfieldUserName).to.equal('');
        expect(_component.instance().inputfieldPassword).to.equal('');
        done();
      }).catch(done);
    });
  });

  it('Calls the setTime function and checks wheter state is updated', (done) => {
    _component = mount(
      <TitleBarContainer urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
        mapProperties={{ boundingBox: emptyObj, projection: emptyObj }}
        user={{ roles: [], isLoggedIn: false }} userActions={{ login: _loginaction, logout: _logoutaction }}
        adagucProperties={{ user: { isLoggedIn: true, userName: 'Blah' } }}
        dispatch={emptyFunc}
        routes={[{ path: 'testpath' }]}
      />
    );
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        const currentTime = moment.utc().format('ddd DD MMM YYYY HH:mm [UTC]').toString();
        _component.instance().setTime();
        expect(_component.state().currentTime).to.equal(currentTime);
        done();
      }).catch(done);
    });
  });
});
