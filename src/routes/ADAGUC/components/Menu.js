import React from 'react';
import { DropdownButton } from 'react-bootstrap';
import { DATASETS } from '../constants/datasets';
// import { setData, setMapStyle, setCut } from '../actions/ADAGUC_actions';
import axios from 'axios';

class MenuItem extends React.Component {
  constructor () {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick (e) {
    // Execute the appropriate data function passed as prop
    this.props.dataFunc(this.props.id);
  }

  render () {
    const { id, content } = this.props;
    return <li><a id={id} onClick={this.handleClick}>{content}</a></li>;
  }
}
MenuItem.propTypes = {
  dataFunc: React.PropTypes.func.isRequired,
  id: React.PropTypes.number,
  children: React.PropTypes.string
};

class Styles extends React.Component {
  constructor () {
    super();
    this.eventOnMapDimUpdate = this.eventOnMapDimUpdate.bind(this);
  }

  eventOnMapDimUpdate () {
    this.setState({ });
  }

  render () {
    const { title, dataFunc, styles } = this.props;
    if (styles) {
      return <DataSelector dataFunc={dataFunc} items={styles.map((style) => style.title)} title={title} />;
    } else {
      return <div />;
    }
  }
}

class SourceSelector extends React.Component {
  render () {
    const { sources, dataFunc, title } = this.props;
    if (sources) {
      return <DataSelector dataFunc={dataFunc} items={sources.map((source) => source.title)} title={title} />;
    } else {
      return <div />;
    }
  }
}
SourceSelector.propTypes = {
  dataFunc : React.PropTypes.func.isRequired,
  sources  : React.PropTypes.array,
  title    : React.PropTypes.string.isRequired
};

class DataSelector extends React.Component {
  render () {
    const { dataFunc, items, title } = this.props;
    if (items) {
      return <DropdownButton bsStyle='primary' bsSize='large' title={title} id={title}>
        { items.map((item, i) => <MenuItem dataFunc={dataFunc} key={i} id={i} content={item} />) }
      </DropdownButton>;
    } else {
      return <div />;
    }
  }
}

class LayerSelector extends React.Component {
  render () {
    const { dataFunc, layers, title } = this.props;
    if (layers) {
      return <DropdownButton bsStyle='primary' bsSize='large' title={title} id={title}>
        { layers.map((item, i) => <MenuItem dataFunc={dataFunc} key={i} id={i} content={item} />) }
      </DropdownButton>;
    } else {
      return <div />;
    }
  }
}


DataSelector.propTypes = {
  dataFunc : React.PropTypes.func.isRequired,
  items    : React.PropTypes.array.isRequired,
  title    : React.PropTypes.string.isRequired
};

export default class Menu extends React.Component {
  render () {
    // console.log(this.props);
    const { setSource, setMapStyle, setCut, setStyle, adagucProperties, setLayer } = this.props;
    // console.log(adagucProperties.sources);
    const mapStyles = ['MWS', 'OpenStreetMap'];
    const cuts = ['Nederland', 'NL + Noordzee', 'West Europa', 'Europa', 'Bonaire', 'Saba & St. Eustatius', 'Noord Amerika', 'Afrika', 'Azi&euml;', 'Australi&euml;'];
    return (<div id='innermenu'>
      <SourceSelector dataFunc={setSource} sources={adagucProperties.sources} title='Sources' />
      <LayerSelector dataFunc={setLayer} layers={adagucProperties.layers} title='Layers' />
      <DataSelector dataFunc={setMapStyle} items={mapStyles} title='Map Styles' />
      <DataSelector dataFunc={setCut} items={cuts} title='Uitsnedes' />
      <Styles styles={adagucProperties.styles} title='Style' dataFunc={setStyle} />
    </div>);
  }
}

Menu.propTypes = {
  adagucProperties : React.PropTypes.object,
  webmapjs         : React.PropTypes.object,
  allelayers       : React.PropTypes.array,
  createMap        : React.PropTypes.func.isRequired,
  setSource        : React.PropTypes.func.isRequired,
  setMapStyle      : React.PropTypes.func.isRequired,
  setCut           : React.PropTypes.func.isRequired,
  setStyle         : React.PropTypes.func.isRequired,
  setLayer         : React.PropTypes.func.isRequired
};
