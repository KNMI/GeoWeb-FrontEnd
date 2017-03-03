import React from 'react';
// eslint-disable-next-line no-unused-vars
import { default as TitleBar } from './TitleBar';
import { mount } from 'enzyme';
var moment = require('moment');
import sinon from 'sinon';

const emptyFunc = () => {
  // This is intentional
};
const emptyObj = {
  // This is intentional
};

describe('(Component) TitleBar', () => {
  let _component;
  beforeEach(() => {
    _component = mount(<TitleBar actions={emptyObj} adagucProperties={emptyObj} dispatch={emptyFunc} />);
  });
  it('Renders a TitleBar', () => {
    const _component = mount(<TitleBar actions={emptyObj} adagucProperties={emptyObj} dispatch={emptyFunc} />);
    expect(_component.type()).to.eql(TitleBar);
  });
  it('Renders initially with the current time', () => {
    const currentTime = moment.utc().format('YYYY MMM DD - HH:mm:ss').toString();
    expect(_component.state().currentTime).to.equal(currentTime);
  });
  it('Calls the login function when the login button is clicked', () => {
    _component.doLogin = sinon.spy();
    const loginComponent = _component.find('#loginIcon');
    expect(loginComponent.length).to.equal(1);
    loginComponent.simulate('click');
    _component.doLogin.should.have.been.calledOnce;
  });
});
