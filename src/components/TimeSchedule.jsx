import React, { PureComponent, Fragment } from 'react';
import moment from 'moment';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';

const OVERLAPS = 'overlaps';
const OVERLAPS_DOUBLE = 'overlapsDouble';
const OVERLAPS_TRIPLE = 'overlapsTriple';
const STYLES = 'styles';

class TimeSchedule extends PureComponent {
  constructor (props) {
    super(props);

    this.getOffset = this.getOffset.bind(this);
    this.getDuration = this.getDuration.bind(this);
    this.annotateOverlappings = this.annotateOverlappings.bind(this);
  }

  /**
   * Detect and annotate overlappings
   * @param {object} series The series to detect and annotate overlappings for
   */
  annotateOverlappings (series) {
    series.ranges.forEach((range, index) => {
      for (let prevIndex = 0; prevIndex < index; prevIndex++) {
        if (range.start.isBefore(series.ranges[prevIndex].end) && range.end.isAfter(series.ranges[prevIndex].start)) {
          range[STYLES].push(OVERLAPS);
          if (series.hasOwnProperty(STYLES)) {
            series[STYLES].push(OVERLAPS);
          } else {
            series[STYLES] = [OVERLAPS];
          }
          break;
        }
      }
    });

    series.ranges.forEach((range, index) => {
      for (let prevIndex = 0; prevIndex < index; prevIndex++) {
        const prevRange = series.ranges[prevIndex];
        if (range.start.isBefore(prevRange.end) && range.end.isAfter(prevRange.start) &&
            prevRange.hasOwnProperty(STYLES) && prevRange[STYLES].includes(OVERLAPS)) {
          range[STYLES].push(OVERLAPS_DOUBLE);
          series[STYLES].push(OVERLAPS_DOUBLE);
          break;
        }
      }
    });

    series.ranges.forEach((range, index) => {
      for (let prevIndex = 0; prevIndex < index; prevIndex++) {
        const prevRange = series.ranges[prevIndex];
        if (range.start.isSameOrBefore(prevRange.end) && range.end.isSameOrAfter(prevRange.start) &&
            prevRange.hasOwnProperty(STYLES) && prevRange[STYLES].includes(OVERLAPS_DOUBLE)) {
          range[STYLES].push(OVERLAPS_TRIPLE);
          series[STYLES].push(OVERLAPS_TRIPLE);
          break;
        }
      }
    });
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
    // prepend with label and annotate overlappings
    series.forEach(serie => {
      serie.ranges.unshift({
        start: startMoment.clone().subtract(majorTickInterval.asMinutes() / 2, 'minutes'),
        end: serie.ranges.reduce((prevMinimum, current) => prevMinimum.isBefore(current.start) ? prevMinimum : current.start, startMoment),
        value: serie.label.charAt(0).toUpperCase() + serie.label.slice(1),
        styles: ['scheduleLabel']
      });
      this.annotateOverlappings(serie);
    });

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

    const remainderRatio = endMoment.diff(majorTicks.slice(-1)[0], 'minutes') / majorTickInterval.asMinutes();
    const numberOfMajorTickIntervals = majorTicks.length + 1 + remainderRatio; // one for the (left/right) margins, interval for the EndMoment
    const marginMajorBasis = 100 / (2 * numberOfMajorTickIntervals); // each margin is half the size of an interval
    const intervalMajorBasis = 100 / numberOfMajorTickIntervals;
    const intervalRatio = majorTickInterval.asMinutes() / minorTickInterval.asMinutes();
    const numberOfMinorTickIntervals = minorTicks.length + 1 + intervalRatio;
    const intervalMinorBasis = 100 / numberOfMinorTickIntervals;

    return <Row className='TimeSchedule'>
      <Col>
        {series.map(serie => {
          let cumOffset = 0;
          let rowClasses = (serie.hasOwnProperty(STYLES) ? serie[STYLES].join(' ') : '') + ' ' + serie.label + ' groupRow';
          return <Row className={rowClasses} key={serie.label}>
            {serie.ranges.map((range, index) => {
              let offsetPerc = this.getOffset(marginMajorBasis, startMoment, range.start, minorTickInterval, intervalMinorBasis);
              let durationPerc = this.getDuration(range.start, range.end, minorTickInterval, intervalMinorBasis);
              let arrowClasses = [];
              let outOfScopeMsg = '';
              if (range.start.isSameOrAfter(range.end)) {
                arrowClasses.push('bothArrow');
                outOfScopeMsg = 'Start time is not before End time';
                durationPerc = intervalMinorBasis;
              }
              // Left out of scope
              if (index > 0 && offsetPerc < marginMajorBasis) {
                arrowClasses.push('leftArrow');
                outOfScopeMsg = 'Start time is before Timeline';
                const newOffsetPerc = marginMajorBasis - intervalMinorBasis;
                const diffPerc = newOffsetPerc - offsetPerc;
                offsetPerc = newOffsetPerc;
                durationPerc -= diffPerc;
                if (durationPerc < intervalMinorBasis) {
                  durationPerc = intervalMinorBasis;
                }
              }
              // Right out of scope
              const durationLimit = 100 - marginMajorBasis;
              if (offsetPerc > (durationLimit - intervalMinorBasis)) {
                arrowClasses.push('rightArrow');
                outOfScopeMsg = 'End time is after Timeline';
                offsetPerc = durationLimit;
                durationPerc = intervalMinorBasis;
              }
              if ((offsetPerc + durationPerc) > (durationLimit + intervalMinorBasis)) {
                arrowClasses.push('rightArrow');
                outOfScopeMsg = 'End time is after Timeline';
                durationPerc = durationLimit + intervalMinorBasis - offsetPerc;
              }
              offsetPerc -= cumOffset;
              cumOffset += durationPerc + offsetPerc;
              offsetPerc += '%';
              durationPerc += '%';
              let classes = range.hasOwnProperty(STYLES) ? range[STYLES].join(' ') : '';
              classes += (range.hasOwnProperty(STYLES) && range[STYLES].includes('scheduleLabel')) ? '' : ' scheduleHighlight';
              classes += ' ' + arrowClasses.join(' ');
              if (range.hasOwnProperty('prefix') && typeof range.prefix === 'string') {
                classes += ' ' + 'showPrefix';
              }
              const value = (range.hasOwnProperty(STYLES) && range[STYLES].includes('scheduleLabel') && !serie.isLabelVisible) ? '' : range.value;
              const title = (typeof range.prefix === 'string' ? `${range.prefix}: ${value}` : value) + (outOfScopeMsg.length > 0 ? ` (${outOfScopeMsg})` : '');
              return <Col className={classes} data-prefix={range.prefix}
                key={serie.label + index} style={{ marginLeft: offsetPerc, flexBasis: durationPerc, maxWidth: durationPerc }}
                title={title}>
                {value}
              </Col>;
            })}
          </Row>;
        })}
        {/**
           * Draw the axis
           */}
        <Row className='marks' style={{ marginTop: '0.7rem' }}>
          <Col style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
          <Col className='tick' style={{ flexBasis: intervalMajorBasis + '%', maxWidth: intervalMajorBasis + '%' }} />
          {majorTicks.map((tick, index, ticks) =>
            index !== ticks.length - 1
              ? <Col className='tick' key={'tickMajorTop' + index} style={{ flexBasis: intervalMajorBasis + '%', maxWidth: intervalMajorBasis + '%' }} />
              : <Col className='tick' key={'tickMajorTop' + index} style={{ flexBasis: intervalMajorBasis * remainderRatio + '%', maxWidth: intervalMajorBasis * remainderRatio + '%' }} />
          )}
          <Col className='tick' style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
        </Row>
        <Row className='axis marks'>
          <Col style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
          <Col className='tick' style={{ flexBasis: intervalMinorBasis + '%', maxWidth: intervalMinorBasis + '%' }} />
          {minorTicks.map((tick, index) => {
            // const isMajorTick = ((index + 1) / intervalRatio) % 1 === 0;
            return <Col className='tick' key={'tickMinor' + index}
              style={{ flexBasis: intervalMinorBasis + '%', maxWidth: intervalMinorBasis + '%' }} title={tick.format('DD-MM HH:mm')} />;
          })}
          <Col className='tick' style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
        </Row>
        <Row className='marks'>
          <Col style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
          <Col className='tick' style={{ flexBasis: intervalMajorBasis + '%', maxWidth: intervalMajorBasis + '%' }} />
          {majorTicks.map((tick, index, ticks) =>
            index !== ticks.length - 1
              ? <Col className='tick' key={'tickMajorBottom' + index} style={{ flexBasis: intervalMajorBasis + '%', maxWidth: intervalMajorBasis + '%' }} />
              : <Col className='tick' key={'tickMajorBottom' + index} style={{ flexBasis: intervalMajorBasis * remainderRatio + '%', maxWidth: intervalMajorBasis * remainderRatio + '%' }} />
          )}
          <Col className='tick' style={{ flexBasis: marginMajorBasis + '%', maxWidth: marginMajorBasis + '%' }} />
        </Row>
        <Row>
          <Col className='tick' style={{ flexBasis: intervalMajorBasis + '%', maxWidth: intervalMajorBasis + '%' }}>{startMoment.format('DD-MM HH:mm')}</Col>
          {majorTicks.map((tick, index, ticks) =>
            index !== ticks.length - 1
              ? <Col className='tick' key={'tickMajorLabel' + index} style={{ flexBasis: intervalMajorBasis + '%', maxWidth: intervalMajorBasis + '%' }}>{tick.format('HH:mm')}</Col>
              : <Fragment key={'tickMajorLabel' + index}>
                <Col style={{ flexBasis: intervalMajorBasis * (1 - remainderRatio) / 2 + '%', maxWidth: intervalMajorBasis * (1 - remainderRatio) / 2 + '%' }} />
                <Col className='tick' style={{ flexBasis: intervalMajorBasis * remainderRatio + '%', maxWidth: intervalMajorBasis * remainderRatio + '%' }}>{tick.format('HH:mm')}</Col>
              </Fragment>
          )}
          <Col className='tick' style={{ flexBasis: intervalMajorBasis * remainderRatio + '%', maxWidth: intervalMajorBasis * remainderRatio + '%' }}>{endMoment.format('DD-MM HH:mm')}</Col>
        </Row>
      </Col>
    </Row>;
  }
}

TimeSchedule.defaultProps = {
  startMoment: moment.utc().subtract(12, 'hour'),
  endMoment: moment.utc().add(12, 'hour'),
  majorTickInterval: moment.duration(6, 'hour'),
  minorTickInterval: moment.duration(1, 'hour'),
  series: [ { label: 'default label', ranges: [ { start: moment.utc().subtract(6, 'hour'), end: moment.utc().add(6, 'hour'), value: 'default value', prefix: null, styles: [] } ] } ]
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
      value: PropTypes.string,
      prefix: PropTypes.string,
      styles: PropTypes.arrayOf(PropTypes.string)
    })),
    styles: PropTypes.arrayOf(PropTypes.string)
  }))
};

export default TimeSchedule;
