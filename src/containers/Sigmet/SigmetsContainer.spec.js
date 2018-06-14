import React from 'react';
import SigmetsContainer from './SigmetsContainer';
import { mount } from 'enzyme';

describe('(Container) Sigmet/SigmetsContainer', () => {
  it('renders a SigmetsContainer', () => {
    const drawProperties = {
      adagucMapDraw: {
        geojson: {
          features: []
        }
      }
    };
    const urls = {
      BACKEND_SERVER_URL: 'http://localhost'
    };
    const _component = mount(<SigmetsContainer drawProperties={drawProperties} urls={urls} />);
    expect(_component.type()).to.eql(SigmetsContainer);
  });
});
