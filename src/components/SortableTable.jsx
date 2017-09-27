import React, { Component } from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import Icon from 'react-fa';
import PropTypes from 'prop-types';

let getWindTAC = (taf) => {
  let windValue = null;
  if (taf) {
    if (taf.wind) {
      windValue = taf.wind.direction + '' + taf.wind.speed;
      if (taf.wind.gusts) {
        windValue += 'G' + taf.wind.gusts;
      }
      windValue += taf.wind.unit;
    }
  }
  return windValue;
};

let getValidPeriodTAC = (taf) => {
  return 'vp';
};

const SortableItem = SortableElement(({ value }) => {
  let rows = [];
  rows.push(<td className='noselect' ><Icon name='bars' /></td>);
  for (let j = 0; j < value.length; j++) {
    rows.push(<td><input style={{ width:'100%' }} value={value[j]} /></td>);
  }
  for (let j = value.length; j < 11; j++) {
    rows.push(<td><input style={{ width:'100%' }} /></td>);
  }
  return (
    <tr>
      {rows}
    </tr>
  );
});

const SortableList = SortableContainer(({ items, taf }) => {
  let rows = [];
  rows.push(<td className='noselect' >&nbsp;</td>);
  rows.push(<td>EHAM</td>);
  rows.push(<td className='noselect' >&nbsp;</td>);

  if (taf) {
    let validPeriodValue = getValidPeriodTAC(taf.forecast);
    if (validPeriodValue) rows.push(<td><input value={validPeriodValue} /></td>);

    let windValue = getWindTAC(taf.forecast);
    if (windValue) rows.push(<td><input value={windValue} /></td>);
  }

  return (
    <div>
      <table className='TafStyle'>
        <thead>
          <tr>
            <th style={{ padding:'0 1em 0 1em' }}>&nbsp;</th>
            <th>Location</th>
            <th>&nbsp;</th>
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
            {rows}
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
          {items.map((value, index) => (
            <SortableItem key={`item-${index}`} index={index} value={value} />
          ))}
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
      items: [
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]
    };
  };

  onSortEnd ({ oldIndex, newIndex }) {
    this.setState({
      items: arrayMove(this.state.items, oldIndex, newIndex)
    });
  };

  render () {
    console.log(this.props.taf);
    return <SortableList items={this.state.items} taf={this.props.taf} onSortEnd={this.onSortEnd} />;
  }
}

SortableComponent.propTypes = {
  taf: PropTypes.object
};

export default SortableComponent;
