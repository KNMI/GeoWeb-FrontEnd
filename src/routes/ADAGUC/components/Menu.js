import React from 'react';
import { DropdownButton } from 'react-bootstrap';

import { connect } from 'react-redux';
// import { setData, setMapStyle, setCut } from '../actions/ADAGUC_actions';

class MenuItem extends React.Component {
  constructor () {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick (e) {
    // Execute the appropriate data function passed as prop
    this.props.dataFunc(this.props.arg);
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
    const { webmapjs, dataFunc } = this.props;
    if (webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) { // TODO mount/unmount
        this.listenersInitialized = true;
        webmapjs.addListener('onmapdimupdate', this.eventOnMapDimUpdate, true);
      }
      if (webmapjs.getActiveLayer() !== undefined) {
        const styles = webmapjs.getActiveLayer().styles;
        if (styles !== undefined) {
          console.log(styles);
          return <DataSelector dataFunc={dataFunc} items={styles.map((style) => style.title)} title='Style' arg={styles.map((style) => style.name)} />;
        } else {
          return <div />;
        }
      } else {
        return <div />;
      }
    }
    return <div />;
  }
}

class DataSelector extends React.Component {
  render () {
    const { dataFunc, items, title, arg } = this.props;
    return <DropdownButton bsStyle='primary' bsSize='large' title={title} id={title}>
      { items.map((item, i) => <MenuItem dataFunc={dataFunc} key={i} id={i} content={item} arg={arg ? arg[i] : i} />) }
    </DropdownButton>;
  }
}

DataSelector.propTypes = {
  dataFunc : React.PropTypes.func.isRequired,
  items    : React.PropTypes.array.isRequired,
  title    : React.PropTypes.string.isRequired
};

export default class Menu extends React.Component {
  render () {
    const { setData, setMapStyle, setCut, setStyle } = this.props;
    const datasets = ['HARMONIE Flux', 'HARMONIE Air temp', 'Radar', 'Satellite IR', 'Satellite CINESAT'];
    const mapStyles = ['MWS', 'OpenStreetMap'];
    const cuts = ['Nederland', 'NL + Noordzee', 'West Europa', 'Europa', 'Bonaire', 'Saba & St. Eustatius', 'Noord Amerika', 'Afrika', 'Azi&euml;', 'Australi&euml;'];
    return (<div id='innermenu'>
      <DataSelector dataFunc={setData} items={datasets} title='Datasets' />
      <DataSelector dataFunc={setMapStyle} items={mapStyles} title='Map Styles' />
      <DataSelector dataFunc={setCut} items={cuts} title='Uitsnedes' />
      <Styles webmapjs={this.props.webmapjs} dataFunc={setStyle} />
    </div>);
  }
}

Menu.propTypes = {
  adagucProperties : React.PropTypes.object,
  webmapjs         : React.PropTypes.object,
  createMap        : React.PropTypes.func.isRequired,
  setData          : React.PropTypes.func.isRequired,
  setMapStyle      : React.PropTypes.func.isRequired,
  setCut           : React.PropTypes.func.isRequired,
  setStyle         : React.PropTypes.func.isRequired
};
