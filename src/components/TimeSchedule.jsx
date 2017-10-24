import React, { PureComponent } from 'react';
import moment from 'moment';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';

class TimeSchedule extends PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      zoomed: false
    };
  }

  render () {
    const { startMoment, endMoment, majorTickInterval, minorTickInterval, items, zoomed } = this.props;

    console.log('Zoomed', zoomed);

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
    const marginMajorBasis = 100 / (2 * numberOfMajorTickIntervals) + '%'; // each margin is half the size of an interval
    const intervalMajorBasis = 100 / numberOfMajorTickIntervals + '%';

    const numberOfMinorTickIntervals = minorTicks.length + 1 + (majorTickInterval.asMinutes() / minorTickInterval.asMinutes());
    const intervalMinorBasis = 100 / numberOfMinorTickIntervals + '%';

    return <Row className='TimeSchedule'>
      <Col>
        <Row style={{ minHeight: '2rem' }}>
          <Col style={{ flexBasis: marginMajorBasis, maxWidth: marginMajorBasis }} />
          <Col style={{ backgroundColor: 'orange', borderRadius: '0.1rem', padding: '0.4rem' }}>
            <strong>Clouds:</strong> {items[0].properties.clouds}
          </Col>
        </Row>
        <Row style={{ minHeight: '1rem' }} />
        <Row className='marks'>
          <Col style={{ flexBasis: marginMajorBasis, maxWidth: marginMajorBasis }} />
          <Col className='tick' style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }} />
          {majorTicks.map((tick, index) => <Col className='tick' key={'tickMajorTop' + index} style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }} />)}
          <Col className='tick' style={{ flexBasis: marginMajorBasis, maxWidth: marginMajorBasis }} />
        </Row>
        <Row className='axis marks'>
          <Col style={{ flexBasis: marginMajorBasis, maxWidth: marginMajorBasis }} />
          <Col className='tick' style={{ flexBasis: intervalMinorBasis, maxWidth: intervalMinorBasis }} />
          {minorTicks.map((tick, index) => <Col className='tick' key={'tickMinor' + index} style={{ flexBasis: intervalMinorBasis, maxWidth: intervalMinorBasis }} />)}
          <Col className='tick' style={{ flexBasis: marginMajorBasis, maxWidth: marginMajorBasis }} />
        </Row>
        <Row className='marks'>
          <Col style={{ flexBasis: marginMajorBasis, maxWidth: marginMajorBasis }} />
          <Col className='tick' style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }} />
          {majorTicks.map((tick, index) => <Col className='tick' key={'tickMajorBottom' + index} style={{ flexBasis: intervalMajorBasis, maxWidth: intervalMajorBasis }} />)}
          <Col className='tick' style={{ flexBasis: marginMajorBasis, maxWidth: marginMajorBasis }} />
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
  zoomed: false,
  startMoment: moment().subtract(12, 'hour'),
  endMoment: moment().add(12, 'hour'),
  majorTickInterval: moment.duration(6, 'hour'),
  minorTickInterval: moment.duration(1, 'hour'),
  items: { start: moment().subtract(12, 'hour'), end: moment().add(12, 'hour'), properties: [] }
};

TimeSchedule.propTypes = {
  zoomed: PropTypes.bool,
  startMoment: MomentPropTypes.momentObj,
  endMoment: MomentPropTypes.momentObj,
  majorTickInterval: MomentPropTypes.momentDurationObj,
  minorTickInterval: MomentPropTypes.momentDurationObj,
  items: PropTypes.array
};

export default TimeSchedule;
