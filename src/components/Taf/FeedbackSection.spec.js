import React from 'react';
import FeedbackSection from './FeedbackSection';
import { mount } from 'enzyme';

describe('(Component) Taf/FeedbackSection', () => {
  it('renders a FeedbackSection', () => {
    const _component = mount(<FeedbackSection><div /><div /></FeedbackSection>);
    expect(_component.type()).to.eql(FeedbackSection);
  });
});
