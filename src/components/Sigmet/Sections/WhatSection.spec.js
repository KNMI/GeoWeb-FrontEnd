import React from 'react';
import WhatSection from './WhatSection';
import { mount } from 'enzyme';

describe('(Component) Sigmet/WhatSection', () => {
  it('renders a WhatSection', () => {
    const _component = mount(<WhatSection><div /><div /></WhatSection>);
    expect(_component.type()).to.eql(WhatSection);
  });
});
