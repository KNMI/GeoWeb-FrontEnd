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
    this.renderMenu = this.renderMenu.bind(this);
    this.modelChanger = this.modelChanger.bind(this);
    this.toggleType = this.toggleType.bind(this);
    this.clearTypeAhead = this.clearTypeAhead.bind(this);
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
  clearTypeAhead () {
    if (!this.state.typeahead) return;
    if (!this.state.typeahead.getInstance()) return;
    this.state.typeahead.getInstance().clear();
  }
  componentDidUpdate (prevProps) {
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

  locationSetter () {
    const panelOpts = ['TIMESERIES', 'PROGTEMP'];
    if (panelOpts.some((t) => t === this.props.type)) {
      return <div style={{ marginRight: '0.25rem', maxWidth: '13rem' }}>
        <Typeahead onClick={this.clearTypeAhead} onFocus={this.clearTypeAhead} bsSize='sm' ref={(typeahead) => this.setState({ typeahead: typeahead })} onChange={this.setChosenLocation}
          options={this.props.locations || []} labelKey='name' placeholder='Select ICAO location&hellip;' submitFormOnEnter />
      </div>;
    }
  }

  // TODO: Implement this when more models are available
  modelChanger () {
    const panelOpts = ['TIMESERIES', 'PROGTEMP'];
    if (panelOpts.some((t) => t === this.props.type)) {
      return <ButtonDropdown size='sm' style={{ marginRight: '0.25rem' }} isOpen={this.state.modelIsOpen} toggle={() => {}}>
        <DropdownToggle caret size='sm'>
          {this.props.referenceTime
            ? 'HARMONIE - ' + this.props.referenceTime.format('ddd DD, HH:mm UTC')
            : 'HARMONIE'}
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>HARMONIE</DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>;
    }
  }

  toggleType () {
    this.setState({
      typeIsOpen: !this.state.typeIsOpen
    });
  }

  renderMenu () {
    const { type, mapId, dispatch, layerActions } = this.props;
    return (<ButtonDropdown style={{ marginRight: '0.25rem' }} isOpen={this.state.typeIsOpen} toggle={() => {}}>
      <DropdownToggle caret style={{ textTransform: 'capitalize' }} size='sm'>
        {type.toLowerCase()}
      </DropdownToggle>
      <DropdownMenu>
        {
          ['ADAGUC', 'TIMESERIES', 'PROGTEMP'].map((type) =>
            <DropdownItem style={{ textTransform: 'capitalize' }} onClick={(e) => { dispatch(layerActions.setPanelType({ type, mapId })); }} >{type.toLowerCase()}</DropdownItem>)
        }
      </DropdownMenu>
    </ButtonDropdown>);
  }

  render () {
    const { title, style, className, mapId, dispatch, type, mapActions, mapMode } = this.props;
    const panelOpts = ['ADAGUC', 'TIMESERIES', 'PROGTEMP'];
    if (!title) {
      const onClick = type === 'ADAGUC' ? (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!mapActions) return;
        if (mapMode !== 'progtemp' && mapMode !== 'timeseries' && !className && type === 'ADAGUC') {
          dispatch(mapActions.setActivePanel(mapId));
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
              <div style={{ marginTop: '0.33rem', flexWrap: 'wrap' }}>
                {this.renderMenu()}
                {this.modelChanger()}
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
  layerActions: PropTypes.object,
  adagucActions: PropTypes.object,
  id: PropTypes.string,
  mapMode: PropTypes.string,
  referenceTime: PropTypes.object,
  location: PropTypes.object,
  type: PropTypes.string,
  locations: PropTypes.array
};

export default Panel;
