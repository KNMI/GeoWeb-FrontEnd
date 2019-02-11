import React from 'react';
import IssueSection from './IssueSection';
import { mount } from 'enzyme';

describe('(Component) SectionTemplates/IssueSection', () => {
  it('renders a IssueSection', () => {
    const _component = mount(<IssueSection><div /><div /></IssueSection>);
    expect(_component.type()).to.eql(IssueSection);
  });
});
