import React from 'react';
import { ApiDemo } from 'routes/ApiDemo/components/ApiDemo';
import { mount } from 'enzyme';

describe('(View) ApiDemo', () => {
  let _component;

  beforeEach(() => {
    _component = mount(<ApiDemo />);
  });

  it('Renders a welcome message', () => {
    const welcome = _component.find('h4');
    expect(welcome).to.exist;
    expect(welcome.text()).to.match(/Welcome!/);
  });

  it('Renders an awesome duck image', () => {
    const duck = _component.find('img');
    expect(duck.props().alt).to.match(/This is a duck, because Redux!/);
  });
});
