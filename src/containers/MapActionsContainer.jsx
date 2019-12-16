import React, { Component } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Panel from '../components/Panel';
import { Icon } from 'react-fa';
import ProgtempPopoverComponent from '../components/ProgtempPopoverComponent';
import TimeseriesPopoverComponent from '../components/TimeseriesPopoverComponent';
import PropTypes from 'prop-types';
var moment = require('moment');

class MapActionContainer extends Component {
  constructor (props) {
    super(props);
    // Toggles
    this.togglePopside = this.togglePopside.bind(this);
    this.toggleProgtempPopover = this.toggleProgtempPopover.bind(this);
    // Button handlers
    this.handleActionClick = this.handleActionClick.bind(this);

    // Render functions
    this.renderTimeseriesPopover = this.renderTimeseriesPopover.bind(this);

    // State
    this.state = {
      collapse: false,
      popoverOpen: false,
      layerChooserOpen: false,
      activeTab: '1',
      getCapBusy: false,
      filter: ''
    };
  }

  handleActionClick (action) {
    let toggleProgtemp = false;
    let toggleTimeseries = false;
    const { dispatch, mapActions } = this.props;
    if (action === 'progtemp' && this.state.progTempPopOverOpen) {
      this.setState({ progTempPopOverOpen: false });
      toggleProgtemp = true;
    }
    if (action === 'timeseries' && this.state.timeSeriesPopOverOpen) {
      this.setState({ timeSeriesPopOverOpen: false });
      toggleTimeseries = true;
    }
    if (toggleProgtemp || toggleTimeseries) {
      dispatch(mapActions.setMapMode('pan'));
      return;
    }
    if (action === 'progtemp') {
      this.setState({ progTempPopOverOpen: true });
    } else {
      this.setState({ progTempPopOverOpen: false });
    }
    if (action === 'timeseries') {
      this.setState({ timeSeriesPopOverOpen: true });
    } else {
      this.setState({ timeSeriesPopOverOpen: false });
    }
    dispatch(mapActions.setMapMode(action));
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevState.layerChooserOpen && this.state.layerChooserOpen) {
      document.getElementById('filterInput').focus();
    }
  }

  togglePopside () {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  }
  toggleProgtempPopover () {
    this.setState({ progTempPopOverOpen: !this.state.progTempPopOverOpen });
  }

  renderProgtempPopover (adagucTime) {
    if (this.state.progTempPopOverOpen) {
      const { dispatch, adagucActions, panelsProperties, mapProperties } = this.props;
      return <ProgtempPopoverComponent urls={this.props.urls} mapProperties={mapProperties} panelsProperties={panelsProperties} adagucProperties={this.props.adagucProperties}
        isOpen={this.state.progTempPopOverOpen} dispatch={dispatch} adagucActions={adagucActions} />;
    }
  }

  renderTimeseriesPopover (adagucTime) {
    if (this.state.timeSeriesPopOverOpen) {
      const { dispatch } = this.props;
      return <TimeseriesPopoverComponent urls={this.props.urls} mapProperties={this.props.mapProperties} panelsProperties={this.props.panelsProperties} adagucProperties={this.props.adagucProperties}
        adagucActions={this.props.adagucActions} isOpen={this.state.timeSeriesPopOverOpen} dispatch={dispatch} />;
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.state !== nextState ||
           this.props.adagucProperties.cursor !== nextProps.adagucProperties.cursor ||
           this.props.mapProperties.mapMode !== nextProps.mapProperties.mapMode ||
           this.props.user !== nextProps.user;
  }

  /* Some options have been commented as a way to disable them */
  render () {
    const { title, adagucProperties, mapProperties } = this.props;
    const items = [
      {
        title: 'Pan / zoom',
        action: 'pan',
        icon: 'hand-stop-o'
      },
      {
        title: 'Zoom to rectangle',
        action: 'zoom',
        icon: 'search-plus'
      },
      /*       {
        title: 'Draw polygon',
        action: 'draw',
        icon: 'pencil'
      }, */
      /*       {
        title: 'Delete drawing point',
        action: 'delete',
        icon: 'trash'
      }, */
      {
        title: 'Measure distance',
        action: 'measure',
        icon: 'arrows-h'
      }/* ,
      {
        title: 'Show time series',
        action: 'timeseries',
        icon: 'line-chart',
        onClick: 'timeseries',
        disabled: !this.props.user || !this.props.user.isLoggedIn
      }, */
      /*       {
        title: 'Show progtemp',
        action: 'progtemp',
        icon: 'bullseye',
        onClick: 'progtemp',
        disabled: !this.props.user || !this.props.user.isLoggedIn
      } */
    ];

    return (
      <Col className='MapActionContainer'>
        {this.renderProgtempPopover(moment.utc(adagucProperties.timeDimension))}
        {this.renderTimeseriesPopover()}
        <Panel className='Panel' title={title}>
          {items.map((item, index) =>
            <Button color='primary' key={index} active={mapProperties.mapMode === item.action} disabled={item.disabled || null}
              className='row' id={item.action + '_button'} title={item.title} onClick={() => this.handleActionClick(item.action)}>
              <Icon name={item.icon} />
            </Button>)}
          <Row style={{ flex: 1 }} />
        </Panel>
      </Col>
    );
  }
}

MapActionContainer.propTypes = {
  title: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  mapProperties: PropTypes.object,
  adagucProperties: PropTypes.object,
  adagucActions: PropTypes.object,
  panelsProperties: PropTypes.object,
  mapActions: PropTypes.object,
  urls: PropTypes.object,
  user: PropTypes.object
};

export default MapActionContainer;
