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
    const { startMoment, endMoment, majorTickInterval, minorTickInterval, items, groups } = this.props;
    console.log('Props', items);

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
        {groups.map((groupName) => {
          return <Row className={groupName + ' groupRow'} key={groupName} style={{ minHeight: '2.4rem' }}>
            <Col style={{ flex: 1, flexDirection: 'column' }}>
              {items.filter(item => item.group === groupName).map((item, index) => {
                let offset = this.getOffset(marginMajorBasis, startMoment, item.start, minorTickInterval, intervalMinorBasis);
                let duration = this.getDuration(item.start, item.end, minorTickInterval, intervalMinorBasis);
                console.log('TimeSchedule data:', marginMajorBasis, startMoment.format(), item.start.format(), item.end.format(), minorTickInterval.toString(), intervalMinorBasis);
                console.log('TimeSchedule effect:', offset, duration);
                let arrowClass = '';
                if (offset < marginMajorBasis) {
                  arrowClass += 'leftArrow';
                  offset = marginMajorBasis - intervalMinorBasis;
                }
                if (duration === 0) {
                  duration = intervalMinorBasis;
                }
                if (offset > 100) {
                  arrowClass += 'rightArrow';
                  offset = 100 + intervalMinorBasis;
                  duration = intervalMinorBasis;
                }
                if (offset + duration > 100 + 2 * intervalMinorBasis) {
                  arrowClass += 'rightArrow';
                  duration = 100 + intervalMinorBasis - offset;
                }

                offset += '%';
                duration += '%';
                console.log('TimeSchedule result:', offset, duration);
                /* return <Row style={{ minHeight: '2.4rem' }} key={'item' + index}>
                  <Col style={{ flexBasis: offset, maxWidth: offset }} />
                  <Col className='scheduleHighlight' style={{ flexBasis: duration, maxWidth: duration }}>
                    Test
                  </Col>
                </Row> */
                return <Row key={groupName + ':' + index}>
                  <Col className={'scheduleGroup'} style={{ flexBasis: offset, maxWidth: offset }}>{groupName}</Col>
                  <Col className={'scheduleHighlight' + ' ' + arrowClass} style={{ flexBasis: duration, maxWidth: duration }}>{item.value}</Col>
                </Row>;
              })}
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
  items: [ { start: moment().subtract(6, 'hour'), end: moment().add(6, 'hour'), group: 'default group', value: 'default value' } ],
  groups: ['default group']
};

TimeSchedule.propTypes = {
  startMoment: MomentPropTypes.momentObj,
  endMoment: MomentPropTypes.momentObj,
  majorTickInterval: MomentPropTypes.momentDurationObj,
  minorTickInterval: MomentPropTypes.momentDurationObj,
  items: PropTypes.array,
  groups: PropTypes.array
};

export default TimeSchedule;
