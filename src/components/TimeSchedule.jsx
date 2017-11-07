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

  /**
   * Calculate the offset in percentages
   * @param {number} baseOffsetAsPercentage The additional offset to get to the start / null position
   * @param {moment} baseStart The moment which is mapped / equals the start / null position
   * @param {moment} start The moment to get the offset for
   * @param {moment.duration} tickInterval The moment.duration as the interval of the snapping in time
   * @param {number} intervalSizeAsPercentage The size of the interval of the snapping in percentages
   * @return {number} The offset as a percentage
   */
  getOffset (baseOffsetAsPercentage, baseStart, start, tickInterval, intervalSizeAsPercentage) {
    return baseOffsetAsPercentage + (start.diff(baseStart, 'minutes') / tickInterval.asMinutes()) * intervalSizeAsPercentage;
  }

  /**
   * Calculate the duration in percentages
   * @param {moment} start The start moment for the duration
   * @param {moment} end The end moment for the duration
   * @param {moment.duration} tickInterval The moment.duration as the interval of the snapping in time
   * @param {number} intervalSizeAsPercentage The size of the interval of the snapping in percentages
   * @return {number} The duration as a percentage
   */
  getDuration (start, end, tickInterval, intervalSizeAsPercentage) {
    return end.diff(start, 'minutes') / tickInterval.asMinutes() * intervalSizeAsPercentage;
  }

  render () {
    const { startMoment, endMoment, majorTickInterval, minorTickInterval, series } = this.props;

    // prepend with label
    series.forEach(serie => {
      serie.ranges.unshift({
        start: startMoment.clone().subtract(majorTickInterval.asMinutes() / 2, 'minutes'),
        end: serie.ranges.reduce((prevMinimum, current) => prevMinimum.isBefore(current.start) ? prevMinimum : current.start, startMoment),
        value: serie.label.charAt(0).toUpperCase() + serie.label.slice(1),
        style: 'label'
      });
    });
    console.log('TimeSchedule series:', series);

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
      <Col style={{ flex: 1, flexDirection: 'column' }}>
        {series.map(serie => {
          let cumOffset = 0;
          return <Row className={serie.label + ' groupRow'} key={serie.label}>
            {serie.ranges.map((range, index) => {
              let offsetPerc = this.getOffset(marginMajorBasis, startMoment, range.start, minorTickInterval, intervalMinorBasis);
              let durationPerc = this.getDuration(range.start, range.end, minorTickInterval, intervalMinorBasis);
              let arrowClass = '';
              if (!range.start.isBefore(range.end)) {
                arrowClass = 'bothArrow';
                durationPerc = intervalMinorBasis;
              }
              if (index > 0 && offsetPerc < marginMajorBasis) {
                arrowClass = 'leftArrow';
                offsetPerc = marginMajorBasis - intervalMinorBasis;
              }
              if (offsetPerc > 100) {
                arrowClass = 'rightArrow';
                offsetPerc = 100 + intervalMinorBasis;
                durationPerc = intervalMinorBasis;
              }
              if (offsetPerc + durationPerc > (100 + 2 * intervalMinorBasis)) {
                arrowClass = 'rightArrow';
                durationPerc = 100 + intervalMinorBasis - offsetPerc;
              }
              offsetPerc -= cumOffset;
              cumOffset += durationPerc;
              offsetPerc += '%';
              durationPerc += '%';
              return <Col className={(range.style === 'label' ? 'scheduleLabel' : 'scheduleHighlight') + ' ' + arrowClass}
                key={serie.label + index} style={{ marginLeft: offsetPerc, flexBasis: durationPerc, maxWidth: durationPerc }}>
                {(range.style === 'label' && !serie.isLabelVisible) ? '' : range.value}
              </Col>;
            })}
          </Row>;
        })}
        {/**
           * Draw the axis
           */}
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
  startMoment: moment().utc().subtract(12, 'hour'),
  endMoment: moment().utc().add(12, 'hour'),
  majorTickInterval: moment.duration(6, 'hour'),
  minorTickInterval: moment.duration(1, 'hour'),
  series: [ { label: 'default label', ranges: [ { start: moment().utc().subtract(6, 'hour'), end: moment().utc().add(6, 'hour'), value: 'default value' } ] } ]
};

TimeSchedule.propTypes = {
  startMoment: MomentPropTypes.momentObj,
  endMoment: MomentPropTypes.momentObj,
  majorTickInterval: MomentPropTypes.momentDurationObj,
  minorTickInterval: MomentPropTypes.momentDurationObj,
  series: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    ranges: PropTypes.arrayOf(PropTypes.shape({
      start: MomentPropTypes.momentObj,
      end: MomentPropTypes.momentObj,
      value: PropTypes.object
    }))
  }))
};

export default TimeSchedule;
