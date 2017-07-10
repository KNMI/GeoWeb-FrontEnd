import React from 'react';
import { default as LocationManagementPanel, LocationMapper } from './LocationManagementPanel';
import { mount, shallow } from 'enzyme';

describe('(Component) LocationManagementPanel', () => {
  let _component,
    _deepComponent;
  beforeEach(() => {
    _component = shallow(<LocationManagementPanel />);
    _deepComponent = mount(<LocationManagementPanel />);
  });

  it('Renders a LocationMapper', () => {
    expect(_component.type()).to.eql(LocationMapper);
  });

  it('Renders the EHAM card', () => {
    const cards = _deepComponent.find('.card');
    const firstCard = cards.first();
    const title = firstCard.find('.card-title').first();
    expect(title.text()).to.equal('EHAM');
  });

  it('Can edit a card', () => {
    const cards = _deepComponent.find('.card');
    const firstCard = cards.first();
    const editButton = firstCard.find('.fa-pencil').first();
    editButton.simulate('click');
    const titleInput = _deepComponent.find('.card').first().find('#nameinput0');
    expect(titleInput).to.exist();
  });
});
