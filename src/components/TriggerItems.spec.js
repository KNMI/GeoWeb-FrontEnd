import React from 'react';
import TriggerItems from './TriggerItems';
import { mount } from 'enzyme';

const emptyDispatch = () => null;

describe('(Component) TriggerItems', () => {
  it('Renders a TriggerItems', () => {
    const _component = mount(<TriggerItems title={'title'} icon={'icon'}
      notifications={[]} triggers={[]} discardedTriggers={[]} discardTrigger={emptyDispatch} />);
    expect(_component.type()).to.eql(TriggerItems);
  });
});
