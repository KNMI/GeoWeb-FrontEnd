import React from 'react';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { MAP_STYLES } from '../constants/map_styles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';

class MenuItem extends React.Component {
  constructor () {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick (e) {
    const { dataFunc, dispatch, id } = this.props;
    // Execute the appropriate data function passed as prop
    dispatch(dataFunc(id));
  }
  render () {
    const { item } = this.props;
    return <DropdownItem onClick={this.handleClick}>{item.title}</DropdownItem>;
  }
}

MenuItem.propTypes = {
  dataFunc        : React.PropTypes.func.isRequired,
  dispatch        : React.PropTypes.func.isRequired,
  id              : React.PropTypes.number.isRequired,
  item            : React.PropTypes.object.isRequired
};

class DropdownButton extends React.Component {
  render () {
    const { items, title, isOpen, toggle } = this.props;
    if (items) {
      return (
        <ButtonDropdown isOpen={isOpen} toggle={toggle}>
          <DropdownToggle color='primary' caret>
            {title}
          </DropdownToggle>
          <DropdownMenu>
            {items.map((item, i) => (<MenuItem {...this.props} item={item} id={i} key={i} />))}
          </DropdownMenu>
        </ButtonDropdown>
      );
    } else {
      return (
        <ButtonDropdown isOpen={false} toggle={(e) => { return e; }}>
          <DropdownToggle color='primary' caret disabled>
            {title}
          </DropdownToggle>
        </ButtonDropdown>);
    }
  }
}

DropdownButton.propTypes = {
  items         : React.PropTypes.array,
  title         : React.PropTypes.string.isRequired,
  isOpen        : React.PropTypes.bool.isRequired,
  toggle        : React.PropTypes.func.isRequired
};

export default class Menu extends React.Component {
  constructor (props) {
    super(props);

    this.toggleSources = this.toggleSources.bind(this);
    this.toggleLayers = this.toggleLayers.bind(this);
    this.toggleStyle = this.toggleStyle.bind(this);
    this.toggleView = this.toggleView.bind(this);
    this.toggleOverlay = this.toggleOverlay.bind(this);
    this.toggleMapStyle = this.toggleMapStyle.bind(this);
    this.state = {
      dropdownOpenSources : false,
      dropdownOpenLayer   : false,
      dropdownOpenStyle   : false,
      dropdownOpenMapStyle: false,
      dropdownOpenView    : false,
      dropdownOpenOverlays: false

    };
  }

  toggleSources () {
    this.setState({
      dropdownOpenSources: !this.state.dropdownOpenSources
    });
  }
  toggleLayers () {
    this.setState({
      dropdownOpenLayer: !this.state.dropdownOpenLayer
    });
  }
  toggleStyle () {
    this.setState({
      dropdownOpenStyle: !this.state.dropdownOpenStyle
    });
  }
  toggleView () {
    this.setState({
      dropdownOpenView: !this.state.dropdownOpenView
    });
  }
  toggleOverlay () {
    this.setState({
      dropdownOpenOverlays: !this.state.dropdownOpenOverlays
    });
  }
  toggleMapStyle () {
    this.setState({
      dropdownOpenMapStyle: !this.state.dropdownOpenMapStyle
    });
  }
  render () {
    const { adagucProperties, dispatch, actions } = this.props;
    const { setSource, setMapStyle, setCut, setStyle, setLayer, setOverlay } = actions;
    let overlaysWithReset = adagucProperties.overlayLayers;
    if (overlaysWithReset && overlaysWithReset[overlaysWithReset.length - 1].title !== 'Reset') {
      overlaysWithReset.push({ title: 'Reset' });
    }
    return (
      <div id='innermenu'>
        <DropdownButton dispatch={dispatch} dataFunc={setSource} items={adagucProperties.sources} title='Sources' isOpen={this.state.dropdownOpenSources} toggle={this.toggleSources} />
        <DropdownButton dispatch={dispatch} dataFunc={setLayer} items={adagucProperties.layers} title='Layers' isOpen={this.state.dropdownOpenLayer} toggle={this.toggleLayers} />
        <DropdownButton dispatch={dispatch} dataFunc={setStyle} items={adagucProperties.styles} title='Style' isOpen={this.state.dropdownOpenStyle} toggle={this.toggleStyle} />
        <DropdownButton dispatch={dispatch} dataFunc={setOverlay} items={overlaysWithReset} title='Overlay' isOpen={this.state.dropdownOpenOverlays} toggle={this.toggleOverlay} />
        <DropdownButton dispatch={dispatch} dataFunc={setCut} items={BOUNDING_BOXES} title='View' isOpen={this.state.dropdownOpenView} toggle={this.toggleView} />
        <DropdownButton dispatch={dispatch} dataFunc={setMapStyle} items={MAP_STYLES} title='Map Styles' isOpen={this.state.dropdownOpenMapStyle} toggle={this.toggleMapStyle} />
      </div>
    );
  }
}

Menu.propTypes = {
  adagucProperties : React.PropTypes.object.isRequired,
  actions          : React.PropTypes.object.isRequired,
  dispatch         : React.PropTypes.func.isRequired
};
