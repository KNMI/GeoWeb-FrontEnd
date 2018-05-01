// We only need to import the modules necessary for initial render
import React from 'react';
import Async from 'react-code-splitting';
import BaseLayout from '../layouts/BaseLayout';
import HeaderedLayout from '../layouts/HeaderedLayout';
import SidebarredLayout from '../layouts/SidebarredLayout';
import FooteredLayout from '../layouts/FooteredLayout';

import { actions as userActions } from '../redux/modules/userReducer';
import { actions as mapActions } from '../redux/modules/mapReducer';
import { actions as adagucActions } from '../redux/modules/adagucReducer';
import { actions as panelsActions } from '../redux/modules/panelsReducer';
import { actions as drawActions } from '../redux/modules/drawReducer';
import { Route, IndexRoute } from 'react-router';
import { connect } from 'react-redux';

import TasksContainer from '../containers/TasksContainer';
import ProductsContainer from '../containers/ProductsContainer';
import TriggersContainer from '../containers/TriggersContainer';

import AppManagementPanel from '../components/Management/AppManagementPanel';
import ProductsManagementPanel from '../components/Management/ProductsManagementPanel';
import ProgtempManagementPanel from '../components/Management/ProgtempManagementPanel';
import TafManagementPanel from '../components/Management/TafManagementPanel';
import TafValidationManagementPanel from '../components/Management/TafValidationManagementPanel';
import TafExampleTafManagementPanel from '../components/Management/TafExampleTafManagementPanel';
import TafLocationsManagementPanel from '../components/Management/TafLocationsManagementPanel';
import SigmetParameterManagementPanel from '../components/Management/SigmetParameterManagementPanel';
import LocationManagementPanel from '../components/Management/LocationManagementPanel';
import TafsContainer from '../containers/TafsContainer';
const SigmetManagementPanel = (props) => <Async load={import('../components/Management/SigmetManagementPanel')} componentProps={props} />;
const TitleBarContainer = (props) => <Async load={import('../containers/TitleBarContainer')} componentProps={props} />;
const MapActionsContainer = (props) => <Async load={import('../containers/MapActionsContainer')} componentProps={props} />;
const LayerManagerPanel = (props) => <Async load={import('../components/LayerManagerPanel')} componentProps={props} />;
const MapPanel = (props) => <Async load={import('../components/MapPanel')} componentProps={props} />;
const SidebarContainer = (props) => <Async load={import('../containers/Management/SidebarContainer')} componentProps={props} />;
const ManagementPanel = (props) => <Async load={import('../components/Management/ManagementPanel')} componentProps={props} />;
const SigmetsContainer = (props) => <Async load={import('../containers/Sigmet/SigmetsContainer')} componentProps={props} />;
const mapStateToHeaderProps = state => ({
  title: 'header',
  user: state.userProperties,
  mapProperties: state.mapProperties,
  panelsProperties: state.panelsProperties,
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
    panelsActions
  });
};
const mapStateToSidebarProps = state => ({
  recentTriggers: state.recentTriggers,
  urls: state.urls,
  user: state.userProperties
});

const mapStateToRightSideBarProps = state => ({
  adagucProperties: state.adagucProperties,
  mapProperties: state.mapProperties,
  panelsProperties: state.panelsProperties,
  user: state.userProperties,
  urls: state.urls
});
const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch,
    mapActions,
    adagucActions,
    panelsActions,
    drawActions
  });
};
const mapDispatchToRightSidebarProps = function (dispatch) {
  return ({
    dispatch,
    mapActions,
    panelsActions,
    adagucActions
  });
};
const mapDispatchToLayerManagerProps = function (dispatch) {
  return ({
    dispatch,
    panelsActions,
    adagucActions
  });
};
const mapDispatchToSigmetProps = function (dispatch) {
  return ({
    dispatch,
    drawActions,
    mapActions,
    panelsActions,
    adagucActions
  });
};
const mapStateToMapProps = state => ({
  drawProperties: { ...state.drawProperties },
  mapProperties: { ...state.mapProperties },
  adagucProperties: state.adagucProperties,
  panelsProperties: { ...state.panelsProperties },
  urls: state.urls,
  user: state.userProperties
});

const mapStateToLayerManagerProps = state => ({
  adagucProperties: state.adagucProperties,
  panelsProperties: state.panelsProperties,
  mapProperties: state.mapProperties,
  drawProperties: state.drawProperties,
  urls: state.urls
});

const mapStateToTafsContainerProps = (state) => ({
  adagucProperties: state.adagucProperties,
  panelsProperties: state.panelsProperties,
  mapProperties: state.mapProperties,
  drawProperties: state.drawProperties,
  urls: state.urls,
  user: state.userProperties
});
const mapStateToProductsContainerProps = state => ({
  adagucProperties: state.adagucProperties,
  panelsProperties: state.panelsProperties,
  mapProperties: state.mapProperties,
  drawProperties: state.drawProperties,
  user: state.userProperties
});
// TODO: research this; http://henleyedition.com/implicit-code-splitting-with-react-router-and-webpack/
export const createRoutes = (store) => {
  const header = React.createElement(connect(mapStateToHeaderProps, mapDispatchToHeaderProps)(TitleBarContainer));
  const leftSidebar = React.createElement(connect(mapStateToSidebarProps)(TasksContainer));
  const rightSidebar = React.createElement(connect(mapStateToRightSideBarProps, mapDispatchToRightSidebarProps)(MapActionsContainer));
  const map = connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel);
  const layerManager = React.createElement(connect(mapStateToLayerManagerProps, mapDispatchToLayerManagerProps)(LayerManagerPanel));
  const products = React.createElement(connect(mapStateToProductsContainerProps, mapDispatchToLayerManagerProps)(ProductsContainer));
  const sigmet = React.createElement(connect((state) => ({

    drawProperties: state.drawProperties, urls: state.urls, sources: state.adagucProperties.sources
  }), mapDispatchToSigmetProps)(SigmetsContainer));
  const taf = connect(mapStateToTafsContainerProps, mapDispatchToLayerManagerProps)(TafsContainer);
  const trigger = React.createElement(connect(mapStateToLayerManagerProps, mapDispatchToLayerManagerProps)(TriggersContainer));
  const manageLeft = React.createElement(SidebarContainer);
  const appmanPanel = AppManagementPanel;
  const prodmanPanel = ProductsManagementPanel;
  const progmanPanel = connect((state) => ({ urls: state.urls }))(ProgtempManagementPanel);
  const tafmanPanel = TafManagementPanel;
  const tafLocmanPanel = connect((state) => ({ urls: state.urls }))(TafLocationsManagementPanel);
  const tafValidmanPanel = connect((state) => ({ urls: state.urls }))(TafValidationManagementPanel);
  const tafexTafmanPanel = connect((state) => ({ urls: state.urls }))(TafExampleTafManagementPanel);
  const sigmanPanel = SigmetManagementPanel;
  const sigparmanPanel = connect((state) => ({ urls: state.urls }))(SigmetParameterManagementPanel);
  const locmanPanel = connect((state) => ({ urls: state.urls }))(LocationManagementPanel);
  const manPanel = ManagementPanel;
  return (
    /* Default route */
    <Route path='/' component={BaseLayout} title='GeoWeb'>
      <Route component={HeaderedLayout} header={header}>
        <Route component={FooteredLayout} footer={layerManager}>
          <Route component={SidebarredLayout} leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
            <IndexRoute component={map} />
          </Route>
        </Route>
        <Route path='products' title='Products'>
          {/* Here all product routes */}
          <Route component={FooteredLayout} footer={layerManager} >
            <Route component={SidebarredLayout} secondLeftSidebar={products} leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
              <IndexRoute component={map} />
            </Route>
          </Route>
          <Route path='sigmets' title='SIGMETs'>
            <Route component={SidebarredLayout} secondLeftSidebar={sigmet} leftSidebar={leftSidebar}>
              <Route component={FooteredLayout} footer={layerManager} >
                <Route component={SidebarredLayout} rightSidebar={rightSidebar}>
                  <IndexRoute component={map} />
                </Route>
              </Route>
            </Route>
          </Route>
          <Route path='tafs' title='TAFs'>
            <Route component={SidebarredLayout} leftSidebar={leftSidebar} >
              <Route component={FooteredLayout} >
                <IndexRoute component={taf} />
              </Route>
            </Route>
          </Route>

        </Route>
        <Route path='monitoring_and_triggers' title='Monitoring & Triggers'>
          <Route component={SidebarredLayout} secondLeftSidebar={trigger} leftSidebar={leftSidebar}>
            <Route component={FooteredLayout} footer={layerManager} >
              <Route component={SidebarredLayout} rightSidebar={rightSidebar}>
                <IndexRoute component={map} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path='manage' title='Management'>
          <Route component={SidebarredLayout} leftSidebar={manageLeft}>
            <Route component={FooteredLayout} >
              <IndexRoute component={manPanel} />
            </Route>
            <Route path='app' title='Application'>
              <Route>
                <Route component={FooteredLayout} >
                  <IndexRoute component={appmanPanel} />
                </Route>
              </Route>
              <Route path='locations' title='Locations'>
                <Route>
                  <Route component={FooteredLayout} >
                    <IndexRoute component={locmanPanel} />
                  </Route>
                </Route>
              </Route>

            </Route>
            <Route path='products' title='Products'>
              <Route>
                <Route component={FooteredLayout} >
                  <IndexRoute component={prodmanPanel} />
                </Route>
              </Route>
              <Route path='progtemp' title='Bijvoet'>
                <Route>
                  <Route component={FooteredLayout} >
                    <IndexRoute component={progmanPanel} />
                  </Route>
                </Route>
              </Route>
              <Route path='sigmet' title='SIGMET'>
                <Route>
                  <Route component={FooteredLayout} >
                    <IndexRoute component={sigmanPanel} />
                  </Route>
                </Route>
                <Route path='parameters' title='Parameters'>
                  <Route>
                    <Route component={FooteredLayout} >
                      <IndexRoute component={sigparmanPanel} />
                    </Route>
                  </Route>
                </Route>
              </Route>
              <Route path='taf' title='TAF'>
                <Route>
                  <Route component={FooteredLayout} >
                    <IndexRoute component={tafmanPanel} />
                  </Route>
                </Route>
                <Route path='locations' title='TAF locations'>
                  <Route>
                    <IndexRoute component={tafLocmanPanel} />
                  </Route>
                </Route>
                <Route path='validation' title='Validation'>
                  <Route>
                    <Route component={FooteredLayout} >
                      <IndexRoute component={tafValidmanPanel} />
                    </Route>
                  </Route>
                </Route>
                <Route path='example_tafs' title='Example TAFs'>
                  <Route>
                    <Route component={FooteredLayout}>
                      <IndexRoute component={tafexTafmanPanel} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path='full_screen' title='Full Screen'>
        <Route component={FooteredLayout} footer={layerManager} >
          <IndexRoute component={map} />
        </Route>
      </Route>
      <Route path='*' title='Not found'>
        Not found!
      </Route>
    </Route>
  );
};

export default createRoutes;
