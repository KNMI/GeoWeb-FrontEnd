import React from 'react';
import ConfirmationModal from './ConfirmationModal';
import { mount, shallow } from 'enzyme';
import { Modal } from 'reactstrap';

describe('(Component) ConfirmationModal', () => {
  const config = {
    type: 'test modal',
    title: 'Test Confirmation Modal?',
    message: (identifier) => `Are you sure you want to test ${identifier}?`,
    button: {
      label: 'Test this Modal',
      icon: 'times-circle',
      action: 'testModalAction'
    },
    optional: {
      message: 'Optionally, you can choose a radio button:',
      options: [],
      selectedOption: null,
      action: 'updateSelectedRadio',
      parameters: []
    },
    toggleAction: 'testModalAction'
  };
  it('mount renders a ConfirmationModal', () => {
    const actions = {
      updateSelectedRadio: () => {},
      testModalAction: () => {}
    };
    const dispatch = () => {};
    const _component = mount(<ConfirmationModal actions={actions} dispatch={dispatch} config={config} identifier='tester' />);
    expect(_component.type()).to.eql(ConfirmationModal);
  });

  it('shallow renders a ReactStrap Modal', () => {
    const actions = {
      updateSelectedRadio: () => { },
      testModalAction: () => { }
    };
    const dispatch = () => {};
    const _component = shallow(<ConfirmationModal actions={actions} dispatch={dispatch} config={config} identifier='tester' />);
    expect(_component.type()).to.eql(Modal);
  });
});
