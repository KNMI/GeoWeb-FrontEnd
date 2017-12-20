// We only need to import the modules necessary for initial render
import React from 'react';
import BaseLayout from '../layouts/BaseLayout';
import HeaderedLayout from '../layouts/HeaderedLayout';
import SidebarredLayout from '../layouts/SidebarredLayout';
import FooteredLayout from '../layouts/FooteredLayout';

import { actions as userActions } from '../redux/modules/userReducer';
import { actions as mapActions } from '../redux/modules/mapReducer';
import { actions as adagucActions } from '../redux/modules/adagucReducer';
import { actions as layerActions } from '../redux/modules/layerReducer';
import { actions as drawActions } from '../redux/modules/drawReducer';
import { Route, IndexRoute } from 'react-router';
import { connect } from 'react-redux';

import TitleBarContainer from '../containers/TitleBarContainer';
import MapActionsContainer from '../containers/MapActionsContainer';
import TasksContainer from '../containers/TasksContainer';
import ProductsContainer from '../containers/ProductsContainer';
import SigmetsContainer from '../containers/SigmetsContainer';
import TafsContainer from '../containers/TafsContainer';
import TriggersContainer from '../containers/TriggersContainer';
import MapPanel from '../components/MapPanel';
import LayerManagerPanel from '../components/LayerManagerPanel';
import SmallLayerManagerPanel from '../components/SmallLayerManagerPanel';

import AppManagementPanel from '../components/Management/AppManagementPanel';
import ProductsManagementPanel from '../components/Management/ProductsManagementPanel';
import ProgtempManagementPanel from '../components/Management/ProgtempManagementPanel';
import ManagementPanel from '../components/Management/ManagementPanel';
import TafManagementPanel from '../components/Management/TafManagementPanel';
import TafValidationManagementPanel from '../components/Management/TafValidationManagementPanel';
import TafExampleTafManagementPanel from '../components/Management/TafExampleTafManagementPanel';
import SigmetManagementPanel from '../components/Management/SigmetManagementPanel';
import SigmetParameterManagementPanel from '../components/Management/SigmetParameterManagementPanel';
import LocationManagementPanel from '../components/Management/LocationManagementPanel';
import SidebarContainer from '../containers/Management/SidebarContainer';

const mapStateToHeaderProps = state => ({
  title: 'header',
  user: state.userProperties,
  mapProperties: state.mapProperties,
  layers: state.layers,
  fullState: state,
  urls: state.urls,
  adagucProperties: state.adagucProperties
});
const mapDispatchToHeaderProps = function (dispatch) {
  return ({
    dispatch,
    mapActions,
    adagucActions,
    userActions,
    layerActions
  });
};
const mapStateToSidebarProps = state => ({
  recentTriggers: state.recentTriggers,
  urls: state.urls
});

const mapStateToRightSideBarProps = state => ({
  adagucProperties: state.adagucProperties,
  mapProperties: state.mapProperties,
  layers: state.layers,
  user: state.userProperties,
  urls: state.urls
});
const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch,
    mapActions,
    adagucActions,
    layerActions,
    drawActions
  });
};
const mapDispatchToRightSidebarProps = function (dispatch) {
  return ({
    dispatch,
    mapActions,
    layerActions,
    adagucActions
  });
};
const mapDispatchToLayerManagerProps = function (dispatch) {
  return ({
    dispatch,
    layerActions,
    adagucActions
  });
};
const mapDispatchToSigmetProps = function (dispatch) {
  return ({
    dispatch,
    drawActions,
    mapActions,

    layerActions
  });
};
const mapStateToMapProps = state => ({
  drawProperties: { ...state.drawProperties },
  mapProperties: { ...state.mapProperties },
  adagucProperties: state.adagucProperties,
  layers: { ...state.layers },
  urls: state.urls
});

const mapStateToLayerManagerProps = state => ({
  adagucProperties: state.adagucProperties,
  layers: state.layers,
  mapProperties: state.mapProperties,
  drawProperties: state.drawProperties,
  urls: state.urls
});

// TODO: research this; http://henleyedition.com/implicit-code-splitting-with-react-router-and-webpack/
export const createRoutes = (store) => {
  const header = React.createElement(connect(mapStateToHeaderProps, mapDispatchToHeaderProps)(TitleBarContainer));
  const leftSidebar = React.createElement(connect(mapStateToSidebarProps)(TasksContainer));
  const rightSidebar = React.createElement(connect(mapStateToRightSideBarProps, mapDispatchToRightSidebarProps)(MapActionsContainer));
  const map = connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel);
  const layerManager = React.createElement(connect(mapStateToLayerManagerProps, mapDispatchToLayerManagerProps)(LayerManagerPanel));
  const smallLayerManager = React.createElement(connect(mapStateToLayerManagerProps, mapDispatchToLayerManagerProps)(SmallLayerManagerPanel));
  const products = React.createElement(connect(mapStateToLayerManagerProps, mapDispatchToLayerManagerProps)(ProductsContainer));
  const sigmet = React.createElement(connect((state) => ({
    drawProperties: state.drawProperties, urls: state.urls, sources: state.adagucProperties.sources
  }), mapDispatchToSigmetProps)(SigmetsContainer));
  const taf = React.createElement(connect(mapStateToLayerManagerProps, mapDispatchToLayerManagerProps)(TafsContainer));
  const trigger = React.createElement(connect(mapStateToLayerManagerProps, mapDispatchToLayerManagerProps)(TriggersContainer));
  const manageLeft = React.createElement(SidebarContainer);
  const appmanPanel = React.createElement(AppManagementPanel);
  const prodmanPanel = React.createElement(ProductsManagementPanel);
  const progmanPanel = React.createElement(connect((state) => ({ urls: state.urls }))(ProgtempManagementPanel));
  const tafmanPanel = React.createElement(TafManagementPanel);
  const tafValidmanPanel = React.createElement(connect((state) => ({ urls: state.urls }))(TafValidationManagementPanel));
  const tafexTafmanPanel = React.createElement(connect((state) => ({ urls: state.urls }))(TafExampleTafManagementPanel));
  const sigmanPanel = React.createElement(SigmetManagementPanel);
  const sigparmanPanel = React.createElement(connect((state) => ({ urls: state.urls }))(SigmetParameterManagementPanel));
  const locmanPanel = React.createElement(connect((state) => ({ urls: state.urls }))(LocationManagementPanel));
  const manPanel = React.createElement(ManagementPanel);
  return (
    /* Default route */
    <Route path='/' component={BaseLayout} title='GeoWeb'>
      <Route component={HeaderedLayout} header={header}>
        {/* Here all routes with a header */}
        {/* TODO: Wrapping with empty sidebarredlayout should not be necessary */}
        <Route component={SidebarredLayout} >
          <Route component={FooteredLayout} contextComponent={layerManager}>
            <Route component={SidebarredLayout} leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
              <IndexRoute component={map} />
            </Route>
          </Route>
        </Route>
        <Route path='products' title='Products'>
          {/* Here all product routes */}
          <Route component={SidebarredLayout} secondLeftSidebar={products} leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
            <IndexRoute component={FooteredLayout} viewComponent={map} contextComponent={layerManager} />
          </Route>
          <Route path='sigmets' title='SIGMETs'>
            <Route component={SidebarredLayout} secondLeftSidebar={sigmet} leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
              <IndexRoute component={FooteredLayout} viewComponent={map} contextComponent={layerManager} />
            </Route>
          </Route>
          <Route path='tafs' title='TAFs'>
            <Route component={SidebarredLayout} leftSidebar={leftSidebar} >
              <IndexRoute component={FooteredLayout} viewComponent={taf} />
            </Route>
          </Route>

        </Route>
        <Route path='monitoring_and_triggers' title='Monitoring & Triggers'>
          <Route component={SidebarredLayout} secondLeftSidebar={trigger} leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
            <IndexRoute component={FooteredLayout} viewComponent={map} contextComponent={layerManager} />
          </Route>
        </Route>
        <Route path='manage' title='Management'>
          <Route component={SidebarredLayout} leftSidebar={manageLeft}>
            <IndexRoute component={FooteredLayout} viewComponent={manPanel} />
            <Route path='app' title='Application'>
              <Route>
                <IndexRoute component={FooteredLayout} viewComponent={appmanPanel} />
              </Route>
              <Route path='locations' title='Locations'>
                <Route>
                  <IndexRoute component={FooteredLayout} viewComponent={locmanPanel} />
                </Route>
              </Route>

            </Route>
            <Route path='products' title='Products'>
              <Route>
                <IndexRoute component={FooteredLayout} viewComponent={prodmanPanel} />
              </Route>
              <Route path='progtemp' title='Bijvoet'>
                <Route>
                  <IndexRoute component={FooteredLayout} viewComponent={progmanPanel} />
                </Route>
              </Route>
              <Route path='sigmet' title='SIGMET'>
                <Route>
                  <IndexRoute component={FooteredLayout} viewComponent={sigmanPanel} />
                </Route>
                <Route path='parameters' title='Parameters'>
                  <Route>
                    <IndexRoute component={FooteredLayout} viewComponent={sigparmanPanel} />
                  </Route>
                </Route>
              </Route>
              <Route path='taf' title='TAF'>
                <Route>
                  <IndexRoute component={FooteredLayout} viewComponent={tafmanPanel} />
                </Route>
                <Route path='validation' title='Validation'>
                  <Route>
                    <IndexRoute component={FooteredLayout} viewComponent={tafValidmanPanel} />
                  </Route>
                </Route>
                <Route path='example_tafs' title='Example TAFs'>
                  <Route>
                    <IndexRoute component={FooteredLayout} viewComponent={tafexTafmanPanel} />
                  </Route>
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path='full_screen' title='Full Screen'>
        <Route component={HeaderedLayout}>
          <Route component={SidebarredLayout}>
            <IndexRoute component={FooteredLayout} viewComponent={map} contextComponent={smallLayerManager} />
          </Route>
        </Route>
      </Route>
      <Route path='*' title='Not found'>
        Not found!
      </Route>
    </Route>
  );
};

export default createRoutes;
