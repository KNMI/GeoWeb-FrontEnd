import React, { PureComponent } from 'react';
import moment from 'moment';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';

class TimeSchedule extends PureComponent {
  constructor (props) {
    super(props);

    this.getOffset = this.getOffset.bind(this);
    this.getDuration = this.getDuration.bind(this);
  }

  getOffset (baseOffsetAsPercentage, baseStart, start, tickInterval, intervalSizeAsPercentage) {
    return baseOffsetAsPercentage + (start.diff(baseStart, 'minutes') / tickInterval.asMinutes()) * intervalSizeAsPercentage + '%';
  }

  getDuration (start, end, tickInterval, intervalSizeAsPercentage) {
    return end.diff(start, 'minutes') / tickInterval.asMinutes() * intervalSizeAsPercentage + '%';
  }

  render () {
    const { startMoment, endMoment, majorTickInterval, minorTickInterval, items } = this.props;

    let majorTicks = [];
    let currentMajorTick = startMoment.clone().add(majorTickInterval);
    while (currentMajorTick.isBefore(endMoment)) {
      majorTicks.push(currentMajorTick.clone());
      currentMajorTick.add(majorTickInterval);
    }
    let minorTicks = [];
    let currentMinorTick = startMoment.clone().add(minorTickInterval);
    while (currentMinorTick.isBefore(endMoment)) {
      minorTicks.push(currentMinorTick.clone());
      currentMinorTick.add(minorTickInterval);
    }

    const numberOfMajorTickIntervals = majorTicks.length + 2; // one interval for the EndMoment, one for the (left/right) margins
    const marginMajorBasis = 100 / (2 * numberOfMajorTickIntervals); // each margin is half the size of an interval
    const intervalMajorBasis = 100 / numberOfMajorTickIntervals + '%';

    const numberOfMinorTickIntervals = minorTicks.length + 1 + (majorTickInterval.asMinutes() / minorTickInterval.asMinutes());
    const intervalMinorBasis = 100 / numberOfMinorTickIntervals;

    return <Row className='TimeSchedule'>
      <Col>
        {items.map((item, index) => {
          const offset = this.getOffset(marginMajorBasis, startMoment, item.start, minorTickInterval, intervalMinorBasis);
          const duration = this.getDuration(item.start, item.end, minorTickInterval, intervalMinorBasis);
          return <Row style={{ minHeight: '2.4rem' }} key={'item' + index}>
            <Col style={{ flexBasis: offset, maxWidth: offset }} />
            <Col className='scheduleHighlight' style={{ flexBasis: duration, maxWidth: duration }}>
              <strong>Clouds: </strong> {item.properties.clouds}&nbsp; <strong>Weather: </strong> {item.properties.weather}&nbsp; <strong>Wind: </strong>
              { item.properties.wind && item.properties.wind.direction ? item.properties.wind.direction + '.' + item.properties.wind.speed : ''}
            </Col>
          </Row>;
        })}
        <Row className='marks' style={{ marginTop: '1rem' }}>
          <Col style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
          <Col className='tick' style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }} />
          {majorTicks.map((tick, index) => <Col className='tick' key={'tickMajorTop' + index} style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }} />)}
          <Col className='tick' style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
        </Row>
        <Row className='axis marks'>
          <Col style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
          <Col className='tick' style={{ flexBasis: intervalMinorBasis + '%', maxWidth: intervalMinorBasis + '%' }} />
          {minorTicks.map((tick, index) => <Col className='tick' key={'tickMinor' + index} style={{ flexBasis: intervalMinorBasis + '%', maxWidth: intervalMinorBasis + '%' }} />)}
          <Col className='tick' style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
        </Row>
        <Row className='marks'>
          <Col style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
          <Col className='tick' style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }} />
          {majorTicks.map((tick, index) => <Col className='tick' key={'tickMajorBottom' + index} style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }} />)}
          <Col className='tick' style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
        </Row>
        <Row>
          <Col className='tick' style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }}>{startMoment.format('DD-MM HH:mm')}</Col>
          {majorTicks.map((tick, index) => <Col className='tick' key={'tickMajorLabel' + index} style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }}>{tick.format('HH:mm')}</Col>)}
          <Col className='tick' style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }}>{endMoment.format('DD-MM HH:mm')}</Col>
        </Row>
      </Col>
    </Row>;
  }
}

TimeSchedule.defaultProps = {
  startMoment: moment().subtract(12, 'hour'),
  endMoment: moment().add(12, 'hour'),
  majorTickInterval: moment.duration(6, 'hour'),
  minorTickInterval: moment.duration(1, 'hour'),
  items: [ { start: moment().subtract(12, 'hour'), end: moment().add(12, 'hour'), properties: [] } ]
};

TimeSchedule.propTypes = {
  startMoment: MomentPropTypes.momentObj,
  endMoment: MomentPropTypes.momentObj,
  majorTickInterval: MomentPropTypes.momentDurationObj,
  minorTickInterval: MomentPropTypes.momentDurationObj,
  items: PropTypes.array
};

export default TimeSchedule;
