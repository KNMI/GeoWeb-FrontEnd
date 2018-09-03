import React, { PureComponent } from 'react';
import { Row, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import { Typeahead } from 'react-bootstrap-typeahead';

class Panel extends PureComponent {
  constructor () {
    super();
    this.state = {
      typeIsOpen: false,
      modelIsOpen: false
    };
  }

  render () {
    const { title, style, className, isLoggedIn, mapId, dispatch, type, panelsActions, mapMode } = this.props;
    const panelOpts = ['ADAGUC', 'TIMESERIES', 'PROGTEMP'];
    if (!title) {
      const onClick = type === 'ADAGUC' ? (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!panelsActions) return;
        if (mapMode !== 'progtemp' && mapMode !== 'timeseries' && !className && type === 'ADAGUC') {
          dispatch(panelsActions.setActivePanel(mapId));
        }
      } : null;
      let id;
      if (this.props.id) {
        id = this.props.id;
      } else if (type === 'ADAGUC') {
        id = `adagucPanel${mapId}`;
      }
      return (
        <div className={className ? 'Panel ' + className : 'Panel'} id={id} onClick={onClick}>
          {(type && panelOpts.some((opt) => opt === type))
            ? <Row className='title notitle' style={{ ...style, overflow: 'visible' }}>
              <ModeLocationChanger mapId={mapId} type={type} location={this.props.location}
                dispatch={dispatch} isLoggedIn={isLoggedIn} panelsActions={panelsActions}
                adagucActions={this.props.adagucActions} locations={this.props.locations} referenceTime={this.props.referenceTime} />
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
          if (!panelsActions) return;
          if (mapMode !== 'progtemp' && mapMode !== 'timeseries' && !className) {
            dispatch(panelsActions.setActivePanel(mapId));
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

// TODO: Implement this when more models are available
class ModeLocationChanger extends PureComponent {
  constructor () {
    super();
    this.toggleModelOpen = this.toggleModelOpen.bind(this);
    this.toggleType = this.toggleType.bind(this);
    this.setChosenLocation = this.setChosenLocation.bind(this);
    this.clearTypeAhead = this.clearTypeAhead.bind(this);
    this.state = {
      modelIsOpen: false,
      typeIsOpen: false
    };
  }
  toggleType () {
    this.setState({
      typeIsOpen: !this.state.typeIsOpen
    });
  }

  componentDidUpdate (prevProps) {
    if (this.props.type !== 'ADAGUC') {
      return;
    }
    const { location } = this.props;

    // Clear the Typeahead if previously a location was selected from the dropdown
    // and now a location is selected by clicking on the map
    const prevLoc = prevProps.location;

    // If we clicked on the map...
    if (location && !location.name && prevLoc && prevLoc.name) {
      this.clearTypeAhead();
    }
    // Or in some other panel the location was changed
    if (this.state.location !== location) {
      this.clearTypeAhead();
    }
  }

  toggleModelOpen () {
    this.setState({
      modelIsOpen: !this.state.modelIsOpen
    });
  }

  clearTypeAhead () {
    const { typeahead } = this.state;
    if (typeahead === null || typeahead === undefined || typeahead.instanceRef === null) return;
    const instance = typeahead.getInstance();
    if (instance === null || instance === undefined) return;
    this.state.typeahead.getInstance().clear();
  }

  setChosenLocation (loc) {
    const { dispatch, adagucActions } = this.props;
    if (loc.length > 0) {
      dispatch(adagucActions.setCursorLocation(loc[0]));
      this.setState({ location: loc[0] });
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

  getLocationAsString () {
    const { location } = this.props;
    const panelOpts = ['TIMESERIES', 'PROGTEMP'];
    if (panelOpts.some((t) => t === this.props.type)) {
      if (location) {
        if (location.name) {
          return <span style={{ lineHeight: '2rem', verticalAlign: 'middle' }}>Location: <strong>{location.name}</strong></span>;
        } else if (location.x && location.y) {
          return <span style={{ lineHeight: '2rem', verticalAlign: 'middle' }}>Location: <strong>{this.convertMinSec(location.x) + ', ' + this.convertMinSec(location.y)}</strong></span>;
        } else {
          return <span style={{ lineHeight: '2rem', verticalAlign: 'middle' }}>{location}</span>;
        }
      }
    }
  }

  render () {
    const { type, dispatch, mapId, panelsActions, isLoggedIn } = this.props;
    const panelOpts = ['TIMESERIES', 'PROGTEMP'];
    if (!isLoggedIn) {
      return null;
    }
    if (panelOpts.some((t) => t === this.props.type)) {
      return (
        <div style={{ marginTop: '0.33rem', flexWrap: 'wrap' }}>
          <ButtonDropdown style={{ marginRight: '0.25rem' }} isOpen={this.state.typeIsOpen} toggle={this.toggleType}>
            <DropdownToggle caret style={{ textTransform: 'capitalize' }} size='sm'>
              {type.toLowerCase()}
            </DropdownToggle>
            <DropdownMenu>
              {
                ['ADAGUC', 'TIMESERIES', 'PROGTEMP'].map((type) => {
                  return (<DropdownItem key={`panelType-${type}`} style={{ textTransform: 'capitalize' }}
                    onClick={(e) => { dispatch(panelsActions.setPanelType({ type, mapId })); }} >{type.toLowerCase()}</DropdownItem>);
                })
              }
            </DropdownMenu>
          </ButtonDropdown>
          <ButtonDropdown size='sm' style={{ marginRight: '0.25rem' }} isOpen={this.state.modelIsOpen} toggle={this.toggleModelOpen}>
            <DropdownToggle caret size='sm'>
              {this.props.referenceTime
                ? 'Harmonie36 - ' + this.props.referenceTime.format('ddd DD, HH:mm UTC')
                : 'Harmonie36'}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem>Harmonie36</DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
          <div style={{ marginRight: '0.25rem', maxWidth: '13rem' }}>
            <Typeahead onClick={this.clearTypeAhead} onFocus={this.clearTypeAhead} bsSize='sm' ref={(typeahead) => {
              if (typeahead !== null && typeahead !== this.state.typeahead) {
                this.setState({ typeahead: typeahead });
              }
            }} onChange={this.setChosenLocation} options={this.props.locations || []} labelKey='name' placeholder='Select ICAO location&hellip;' submitFormOnEnter />
          </div>
          {this.getLocationAsString()}
        </div>
      );
    } else {
      return <div style={{ marginTop: '0.33rem', flexWrap: 'wrap' }}>
        <ButtonDropdown style={{ marginRight: '0.25rem' }} isOpen={this.state.typeIsOpen} toggle={this.toggleType}>
          <DropdownToggle caret style={{ textTransform: 'capitalize' }} size='sm'>
            {type.toLowerCase()}
          </DropdownToggle>
          <DropdownMenu>
            {
              ['ADAGUC', 'TIMESERIES', 'PROGTEMP'].map((type) => {
                return (<DropdownItem key={`panelType-${type}`} style={{ textTransform: 'capitalize' }}
                  onClick={(e) => { dispatch(panelsActions.setPanelType({ type, mapId })); }} >{type.toLowerCase()}</DropdownItem>);
              })
            }
          </DropdownMenu>
        </ButtonDropdown>
      </div>;
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
  panelsActions: PropTypes.object,
  adagucActions: PropTypes.object,
  id: PropTypes.string,
  mapMode: PropTypes.string,
  referenceTime: MomentPropTypes.momentObj,
  location: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  type: PropTypes.string,
  locations: PropTypes.array,
  isLoggedIn: PropTypes.bool
};

ModeLocationChanger.propTypes = {
  type: PropTypes.string,
  location: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  dispatch: PropTypes.func,
  adagucActions: PropTypes.object,
  mapId: PropTypes.number,
  panelsActions: PropTypes.object,
  isLoggedIn: PropTypes.bool,
  referenceTime: MomentPropTypes.momentObj,
  locations: PropTypes.array
};

export default Panel;
