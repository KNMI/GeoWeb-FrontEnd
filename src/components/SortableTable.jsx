import React, { Component } from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import moment from 'moment';

let getWindTAC = (taf) => {
  let windValue = null;
  if (taf) {
    if (taf.forecast) {
      if (taf.forecast.wind) {
        windValue = ('0' + taf.forecast.wind.direction).slice(-3) + '' + ('0' + taf.forecast.wind.speed).slice(-2);
        if (taf.forecast.wind.gusts) {
          windValue += 'G' + taf.forecast.wind.gusts;
        }
        windValue += taf.forecast.wind.unit;
      }
    }
  }
  return windValue;
};

let getChangeTAC = (taf) => {
  if (taf) {
    if (taf.changeType) {
      if (taf.changeType.indexOf('PROB') !== -1) {
        return taf.changeType;
      }
    }
  }
  return null;
};

let getProbTAC = (taf) => {
  if (taf) {
    if (taf.changeType) {
      if (taf.changeType.indexOf('PROB') === -1) {
        return taf.changeType;
      }
    }
  }
  return null;
};

const qualifierMap = {
  moderate:'-',
  heavy:'+'
};

const descriptorMap = {
  shallow: 'MI',
  patches: 'BC',
  partial: 'PR',
  'low drifting': 'DR',
  blowing: 'BL',
  showers: 'SH',
  thunderstorm: 'TS',
  freezing: 'FZ'
};

const phenomenaMap = {
  'drizzle': 'DZ',
  'rain': 'RA',
  'snow': 'SN',
  'snow grains': 'SG',
  'ice pellets': 'PL',
  'hail': 'GR',
  'small hail': 'GS',
  'unknown precipitation': 'UP',
  'mist': 'BR',
  'fog': 'FG',
  'smoke': 'FU',
  'volcanic ash': 'VA',
  'widespread dust': 'DU',
  'sand': 'SA',
  'haze': 'HZ',
  'dust': 'PO',
  'squalls': 'SQ',
  'funnel clouds': 'FC',
  'sandstorm': 'SS',
  'duststorm': 'DS'
};

let getVisibilityTAC = (taf) => {
  if (taf && taf.forecast && taf.forecast.visibility && taf.forecast.visibility.value) {
    if (taf.forecast.visibility.unit) {
      if (taf.forecast.visibility.unit === 'KM') {
        return ('0' + taf.forecast.visibility.value).slice(-2) + taf.forecast.visibility.unit;
      } else {
        return taf.forecast.visibility.value;
      }
    } else {
      return taf.forecast.visibility.value;
    }
  }
  return null;
};

let getWeatherTAC = (taf, index) => {
  if (taf && taf.forecast && taf.forecast.weather) {
    if (typeof taf.forecast.weather === 'string') {
      // NSW
      return null;
    }
    if (index >= taf.forecast.weather.length) return null;
    let weather = taf.forecast.weather[index];
    let TACString = '';
    if (weather.qualifier) {
      TACString += qualifierMap[weather.qualifier];
    }
    if (weather.descriptor) {
      TACString += descriptorMap[weather.descriptor];
    }
    if (weather.phenomena) {
      TACString += phenomenaMap[weather.phenomena];
    }
    return TACString;
  }
  return null;
};

let getCloudsTAC = (taf, index) => {
  if (taf && taf.forecast && taf.forecast.clouds) {
    if (typeof taf.forecast.clouds === 'string') {
      return null;
    }
    if (index >= taf.forecast.clouds.length) return null;
    let clouds = taf.forecast.clouds[index];
    if (clouds.amount && clouds.height) {
      return clouds.amount + ('0' + clouds.height).slice(-3);
    }
  }
  return null;
};

let getValidPeriodTAC = (taf) => {
  let dateToDDHH = (dateString) => {
    var day = moment(dateString);
    day.utc();
    return ('0' + day.date()).slice(-2) + '' + ('0' + day.hour()).slice(-2);
  };
  let validityStart = null;
  let validityEnd = null;
  if (taf) {
    if (taf.metadata) {
      validityStart = taf.metadata.validityStart;
      validityEnd = taf.metadata.validityEnd;
    } else {
      validityStart = taf.changeStart;
      validityEnd = taf.changeEnd;
    }
  }
  if (!validityStart || !validityEnd) return '-';
  let validityStartTAC = dateToDDHH(validityStart);
  let validityEndTAC;
  if (validityEnd) {
    validityEndTAC = '/' + dateToDDHH(validityEnd);
  }
  return validityStartTAC + validityEndTAC;
};

let getTACColumnForIndex = (value, index) => {
  switch (index) {
    case 0:
      return (<td className='noselect' ><Icon name='bars' /></td>);
    case 1:
      let v = getProbTAC(value);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
    case 2:
      v = getChangeTAC(value);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
    case 3:
      v = getValidPeriodTAC(value);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
    case 4:
      v = getWindTAC(value);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
    case 5:
      v = getVisibilityTAC(value);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
    case 6:
      v = getWeatherTAC(value, 0);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
    case 7:
      v = getWeatherTAC(value, 1);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
    case 8:
      v = getWeatherTAC(value, 2);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
    case 9:
      v = getCloudsTAC(value, 0);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
    case 10:
      v = getCloudsTAC(value, 1);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
    case 11:
      v = getCloudsTAC(value, 2);
      if (v) {
        return (<td><input value={v} /></td>);
      }
      break;
  }
  return (<td><input value='' /></td>);
};

const SortableItem = SortableElement(({ value }) => {
  let cols = [];
  for (let j = 0; j < 12; j++) {
    cols.push(Object.assign({}, getTACColumnForIndex(value, j), { key:cols.length }));
  }
  return (
    <tr>
      {cols}
    </tr>
  );
});

const SortableList = SortableContainer(({ items, taf }) => {
  let cols = [];
  let location = 'EHAM';
  if (taf && taf.metadata && taf.metadata.location) location = taf.metadata.location;
  let issueTime = moment().utc().add(1, 'hour').format('DD-MM-YYYY HH:00');
  if (taf && taf.metadata && taf.metadata.issueTime) {
    issueTime = taf.metadata.issueTime;
    // if (issueTime.indexOf('T')) {
    //   issueTime = issueTime.split('T')[1];
    // }
  }
  cols.push(<td key={cols.length} className='noselect' >&nbsp;</td>);
  cols.push(<td key={cols.length} className='TACnotEditable'>{location}</td>);
  cols.push(<td key={cols.length} className='TACnotEditable'>{issueTime}</td>);
  cols.push(<td key={cols.length} className='TACnotEditable'>{getValidPeriodTAC(taf)}</td>);
  for (let j = 4; j < 12; j++) {
    cols.push(Object.assign({}, getTACColumnForIndex(taf, j), { key:cols.length }));
  }
  return (
    <div>
      <table className='TafStyle'>
        <thead>
          <tr>
            <th style={{ padding:'0 1em 0 1em' }}>&nbsp;</th>
            <th>Location</th>
            <th>Issue time</th>
            <th>Valid period</th>
            <th>Wind</th>
            <th>Visibility</th>
            <th>Weather</th>
            <th>Weather</th>
            <th>Weather</th>
            <th>Cloud</th>
            <th>Cloud</th>
            <th>Cloud</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {cols}
          </tr>
        </tbody>

        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>Prob</th>
            <th>Change</th>
            <th>Valid period</th>
            <th>Wind</th>
            <th>Visibility</th>
            <th>Weather</th>
            <th>Weather</th>
            <th>Weather</th>
            <th>Cloud</th>
            <th>Cloud</th>
            <th>Cloud</th>
          </tr>
        </thead>
        <tbody>
          {items.map((value, index) => {
            return (<SortableItem key={`item-${index}`} index={index} value={value} />);
          })}
        </tbody>
      </table>
    </div>
  );
});

class SortableComponent extends Component {
  constructor (props) {
    super(props);
    this.onSortEnd = this.onSortEnd.bind(this);
    this.state = {
      items: []
    };
  };

  onSortEnd ({ oldIndex, newIndex }) {
    console.log('onSortEnd', oldIndex, newIndex);
    this.setState({
      items: arrayMove(this.state.items, oldIndex, newIndex)
    });
  };

  componentWillReceiveProps (nextProps) {
    console.log(nextProps);
    let json = null;
    if (nextProps.taf) {
      if (typeof nextProps.taf === 'string') {
        try {
          json = JSON.parse(nextProps.taf);
        } catch (e) {
          console.log(e);
        }
      } else {
        json = nextProps.taf;
      }

      if (json !== null) {
        if (json.changegroups) {
          let uuid = null;
          if (json.metadata && json.metadata.uuid) {
            uuid = json.metadata.uuid;
          }
          if (this.changegroupsSet === uuid && nextProps.update !== true) return;
          this.changegroupsSet = uuid;

          this.setState({
            items: json.changegroups
          });
          return;
        }
      }
    }
    this.setState({
      items: []
    });
  }

  render () {
    return <SortableList items={this.state.items} taf={this.props.taf} onSortEnd={this.onSortEnd} />;
  }
}

SortableComponent.propTypes = {
  taf: PropTypes.object,
  update: PropTypes.bool
};

export default SortableComponent;
