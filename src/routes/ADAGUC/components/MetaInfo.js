import React from 'react';
import { Table } from 'reactable';

export default class MetaInfo extends React.Component {
  constructor () {
    super();
    this.eventOnDimChange = this.eventOnDimChange.bind(this);
    this.eventOnMapDimUpdate = this.eventOnMapDimUpdate.bind(this);
    this.showLayerInfo = this.showLayerInfo.bind(this);
    // this.getLayerName = this.getLayerName.bind(this);
  }
  eventOnMapDimUpdate () {
    this.layer = this.props.webmapjs.getLayers()[0];
    this.eventOnDimChange();
  }

  getLayerName (layer) {
    if (layer) {
      const service = layer.service;
      const title = layer.title;
      let retStr = '';
      if (service.includes('HARM')) {
        retStr = 'HARMONIE - ' + title;
      } else if (service.includes('RADNL')) {
        retStr = 'Radar';
      } else {
        retStr = 'Satellite - ' + title;
      }

      return retStr;
    }
    return null;
  }

  showLayerInfo (layer) {
    if (layer) {
      const layerName = this.getLayerName(layer);
      const layerStyle = layer.getStyle();
      const refTime = layer.getDimension('reference_time');
      let titles = ['Layer name', 'Style'];
      let values = [layerName, layerStyle];
      if (refTime) {
        titles.push('Reference time');
        values.push(refTime.currentValue);
      }
      // Zip two arrays into one object with mapping from titles => values
      let zipped = Object.assign({}, ...titles.map((n, index) => ({ [n]: values[index] })));
      return <Table className='infotable' data={[zipped]} />;
    } else {
      return null;
    }
  };

  eventOnDimChange () {
    this.layer = this.props.webmapjs.getLayers()[0];
    this.setState({});
  }

  render () {
    const { webmapjs } = this.props;
    if (webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) { // TODO mount/unmount
        this.listenersInitialized = true;
        webmapjs.addListener('onmapdimupdate', this.eventOnMapDimUpdate, true);
        // webmapjs.addListener('ondimchange', this.eventOnDimChange, true);
      }
    }
    return <div id='layerproperties'>{this.showLayerInfo(this.layer)}</div>;
  }
}

MetaInfo.propTypes = {
  webmapjs: React.PropTypes.object
};
