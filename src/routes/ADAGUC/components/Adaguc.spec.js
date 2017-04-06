import React from 'react';
import { default as Adaguc } from './Adaguc';
import { default as adagucReducer, actions } from '../modules/adaguc';
import { shallow } from 'enzyme';
import sinon from 'sinon';
describe('(Component) Adaguc', () => {
  let _globalState;
  let _dispatchSpy;
  beforeEach(() => {
    _globalState = {
      adagucProperties : {
        layers: {
          baselayer: {},
          panel: [
            {
              datalayers: [],
              overlays: []
            }, {
              datalayers: [],
              overlays: []
            }, {
              datalayers: [],
              overlays: []
            }, {
              datalayers: [],
              overlays: []
            }
          ]
        },

        sources: {},
        boundingBox: null,
        projectionName: 'EPSG:3857',
        mapCreated: false,
        adagucmapdraw: {
          geojson: {
            coords: {}
          },
          isInEditMode: false,
          isInDeleteMode: false
        },
        adagucmeasuredistance: {
          isInEditMode: false
        }
      }
    };
    _dispatchSpy = sinon.spy((action) => {
      _globalState = {
        ..._globalState,
        adagucProperties : adagucReducer(_globalState.adagucProperties, action)
      };
    });
  });

  it('Renders a div', () => {
    const _component = shallow(<Adaguc adagucProperties={_globalState.adagucProperties} dispatch={_dispatchSpy} actions={actions} />);
    expect(_component.type()).to.eql('div');
  });
});
