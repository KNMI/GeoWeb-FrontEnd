import React from 'react';
import { DropdownButton } from 'react-bootstrap';

class MenuItem extends React.Component {
  constructor () {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick (e) {
    // Execute the appropriate data function passed as prop
    this.props.dispatch(this.props.dataFunc(this.props.id));
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
    const { dataFunc, dispatch, title, styles } = this.props;
    if (styles) {
      return <DataSelector dispatch={dispatch} dataFunc={dataFunc} items={styles.map((style) => style.title)} title={title} />;
    } else {
      return <div />;
    }
  }
}

class SourceSelector extends React.Component {
  render () {
    const { sources, dataFunc, title, dispatch } = this.props;
    if (sources) {
      return <DataSelector dispatch={dispatch} dataFunc={dataFunc} items={sources.map((source) => source.title)} title={title} />;
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
    const { dataFunc, items, title, dispatch } = this.props;
    if (items) {
      return <DropdownButton bsStyle='primary' bsSize='large' title={title} id={title}>
        { items.map((item, i) => <MenuItem dispatch={dispatch} dataFunc={dataFunc} key={i} id={i} content={item} />) }
      </DropdownButton>;
    } else {
      return <div />;
    }
  }
}

class LayerSelector extends React.Component {
  render () {
    const { dataFunc, layers, title, dispatch} = this.props;
    if (layers) {
      return <DropdownButton bsStyle='primary' bsSize='large' title={title} id={title}>
        { layers.map((item, i) => <MenuItem dispatch={dispatch} dataFunc={dataFunc} key={i} id={i} content={item} />) }
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
    const { adagucProperties, dispatch, actions } = this.props;
    const { setSource, setMapStyle, setCut, setStyle, setLayer } = actions;
    // console.log(adagucProperties.sources);
    const mapStyles = ['MWS', 'OpenStreetMap'];
    const cuts = ['Nederland', 'NL + Noordzee', 'West Europa', 'Europa', 'Bonaire', 'Saba & St. Eustatius', 'Noord Amerika', 'Afrika', 'Azi&euml;', 'Australi&euml;'];
    return (<div id='innermenu'>
      <SourceSelector dispatch={dispatch} dataFunc={setSource} sources={adagucProperties.sources} title='Sources' />
      <LayerSelector dispatch={dispatch} dataFunc={setLayer} layers={adagucProperties.layers} title='Layers' />
      <DataSelector dispatch={dispatch} dataFunc={setMapStyle} items={mapStyles} title='Map Styles' />
      <DataSelector dispatch={dispatch} dataFunc={setCut} items={cuts} title='Uitsnedes' />
      <Styles dispatch={dispatch} styles={adagucProperties.styles} title='Style' dataFunc={setStyle} />
    </div>);
  }
}

Menu.propTypes = {
  adagucProperties : React.PropTypes.object,
  webmapjs         : React.PropTypes.object,
  allelayers       : React.PropTypes.array,
  actions          : React.PropTypes.object.isRequired,
  dispatch         : React.PropTypes.func.isRequired
};
