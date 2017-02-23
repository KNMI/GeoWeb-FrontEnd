import React from 'react';
import { Table } from 'reactable';

export default class MetaInfo extends React.Component {
  constructor () {
    super();
    this.showLayerInfo = this.showLayerInfo.bind(this);
    this.getLayerName = this.getLayerName.bind(this);
  }

  getLayerName (layer) {
    if (layer) {
      const service = layer.service;
      let retStr = '';
      if (service.includes('HARM')) {
        retStr = 'HARMONIE';
      } else if (service.includes('RAD')) {
        retStr = 'Radar';
      } else if (service.includes('OBS')) {
        retStr = 'Observation';
      } else {
        retStr = 'Satellite';
      }

      return retStr;
    }
    return null;
  }

  showLayerInfo (layer) {
    if (layer) {
      console.log('here');
      const layerName = this.getLayerName(layer);
      const title = layer.title;
      const layerStyle = layer.getStyle();
      const refTime = layer.getDimension('reference_time');
      let titles = ['Source', 'Layer name', 'Style'];
      let values = [layerName, title, layerStyle];
      if (refTime) {
        titles.push('Reference time');
        values.push(refTime.currentValue);
      }
      // Zip two arrays into one object with mapping from titles => values
      let zipped = Object.assign({}, ...titles.map((n, index) => ({ [n]: values[index] })));
      return <Table className='infotable' data={[zipped]} />;
    } else {
      return <Table />;
    }
  };

  render () {
    const { activeLayer } = this.props;
    return <div id='layerproperties'>{this.showLayerInfo(activeLayer)}</div>;
  }
}

MetaInfo.propTypes = {
  activeLayer: React.PropTypes.object
};
