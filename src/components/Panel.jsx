import React, { PureComponent } from 'react';
import { Row, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';

class Panel extends PureComponent {
  constructor () {
    super();
    this.state = {
      typeIsOpen: false,
      modelIsOpen: false
    };
    this.locationSetter = this.locationSetter.bind(this);
    this.setChosenLocation = this.setChosenLocation.bind(this);
  }
  setChosenLocation (loc) {
    const { dispatch, adagucActions } = this.props;

    // Only dispatch a new location and don't unset it
    // (this happens when the typeahead is cleared because this is a change from its filled state)
    if (loc.length > 0) {
      dispatch(adagucActions.setCursorLocation(loc[0]));
    }
  }
  convertMinSec (loc) {
    function padLeft (nr, n, str) {
      return Array(n - String(nr).length + 1).join(str || '0') + nr;
    }

    const behindComma = (loc - Math.floor(loc));

    const minutes = behindComma * 60;
    const seconds = Math.floor((minutes - Math.floor(minutes)) * 60);

    return Math.floor(loc) + ':' + padLeft(Math.floor(minutes), 2, '0') + ':' + padLeft(seconds, 2, '0');
  }
  clearTypeAhead () {
    if (!this._typeahead) return;
    if (!this._typeahead.getInstance()) return;
    this._typeahead.getInstance().clear();
  }
  componentDidUpdate (prevProps) {
    const { location } = this.props;

    // Clear the Typeahead if previously a location was selected from the dropdown
    // and now a location is selected by clicking on the map
    const prevLoc = prevProps.location;
    if (location && !location.name && prevLoc && prevLoc.name) {
      this.clearTypeAhead();
    }
  }

  getLocationAsString () {
    const { location } = this.props;
    const panelOpts = ['TIMESERIES', 'PROGTEMP'];
    if (panelOpts.some((t) => t === this.props.type)) {
      if (location) {
        if (location.name) {
          return <span style={{ lineHeight: '2rem', verticalAlign: 'middle' }}>Location from list: <strong>{location.name}</strong></span>;
        } else {
          return <span style={{ lineHeight: '2rem', verticalAlign: 'middle' }}>Location from map: <strong>{this.convertMinSec(location.x) + ', ' + this.convertMinSec(location.y)}</strong></span>;
        }
      } else {
        return <span style={{ lineHeight: '2rem', verticalAlign: 'middle' }}>&hellip;or click on the map</span>;
      }
    }
  }

  locationSetter () {
    const panelOpts = ['TIMESERIES', 'PROGTEMP'];
    if (panelOpts.some((t) => t === this.props.type)) {
      return <div style={{ marginRight: '0.25rem' }}>
        <Typeahead ref={ref => { this._typeahead = ref; }}
          onChange={this.setChosenLocation} options={this.props.locations || []} labelKey='name' placeholder='Select ICAO location&hellip;' submitFormOnEnter />
      </div>;
    }
  }

  // TODO: Implement this when more models are available
  modelChanger () {
    const panelOpts = ['TIMESERIES', 'PROGTEMP'];
    if (panelOpts.some((t) => t === this.props.type)) {
      return <ButtonDropdown style={{ marginRight: '0.25rem' }} isOpen={this.state.modelIsOpen} toggle={() => this.setState({ modelIsOpen: !this.state.modelIsOpen })}>
        <DropdownToggle caret size='sm'>
          HARMONIE
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>HARMONIE</DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>;
    }
  }
  renderMenu () {
    const { type, mapId, dispatch, layerActions, active } = this.props;
    return (<ButtonDropdown style={{ marginRight: '0.25rem' }} isOpen={this.state.typeIsOpen} toggle={() => this.setState({ typeIsOpen: !this.state.typeIsOpen })}>
      <DropdownToggle caret style={{ textTransform: 'capitalize' }} size='sm'>
        {type.toLowerCase()}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={(e) => { e.stopPropagation(); e.preventDefault(); dispatch(layerActions.setPanelType({ type: 'ADAGUC', mapId: mapId })); }} >Adaguc map</DropdownItem>
        <DropdownItem onClick={(e) => { e.stopPropagation(); e.preventDefault(); dispatch(layerActions.setPanelType({ type: 'TIMESERIES', mapId: mapId })); }} >Timeseries</DropdownItem>
        <DropdownItem onClick={(e) => { e.stopPropagation(); e.preventDefault(); dispatch(layerActions.setPanelType({ type: 'PROGTEMP', mapId: mapId })); }} >Progtemp</DropdownItem>
      </DropdownMenu>
    </ButtonDropdown>);
  }

  render () {
    const { title, style, className, mapId, dispatch, type, mapActions, mapMode } = this.props;
    const panelOpts = ['ADAGUC', 'TIMESERIES', 'PROGTEMP'];
    if (!title) {
      return (
        <div className={className ? 'Panel ' + className : 'Panel'} id={this.props.id || `adagucPanel${mapId}`} onClick={() => {
          if (!mapActions) return;
          if (mapMode !== 'progtemp' && mapMode !== 'timeseries' && !className) {
            dispatch(mapActions.setActivePanel(mapId));
          }
        }}>

          {(type && panelOpts.some((opt) => opt === type))
            ? <Row className='title notitle' style={{ ...style, overflow: 'visible' }}>
              <div style={{ marginTop: '0.33rem' }}>
                {this.renderMenu()}
                {this.modelChanger()}
                <span style={{ marginRight: '2rem', lineHeight: '2rem', verticalAlign: 'middle' }}>{this.props.referenceTime ? this.props.referenceTime.format('ddd DD, HH:mm UTC') : ''}</span>
                {this.locationSetter()}
                {this.getLocationAsString()}
              </div>
            </Row>
            : <Row className='title notitle' style={style} />
          }
          <Row className='content notitle' style={{ ...style, height: '100%' }}>
            {this.props.children}
          </Row>
        </div>
      );
    } else {
      return (
        <div className={'Panel ' + className} onClick={() => {
          if (!mapActions) return;
          if (mapMode !== 'progtemp' && mapMode !== 'timeseries' && !className) {
            dispatch(mapActions.setActivePanel(mapId));
          }
        }}>
          <Row className='title' style={style}>
            {title || 'Oops'}
          </Row>
          <Row className='content' style={style}>
            {this.props.children}
          </Row>
        </div>
      );
    }
  }
}

Panel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
  style: PropTypes.object,
  className: PropTypes.string,
  mapId: PropTypes.number,
  dispatch: PropTypes.func,
  mapActions: PropTypes.object,
  mapMode: PropTypes.string
};

export default Panel;
