import React from 'react';
import ChangeGroup from './ChangeGroup';
import { mount } from 'enzyme';

describe('(Container) Taf/ChangeGroup.jsx', () => {
  it('Renders a ChangeGroup', () => {
    const _component = mount(<ChangeGroup value={{}} />);
    expect(_component.type()).to.eql(ChangeGroup);
  });
});
