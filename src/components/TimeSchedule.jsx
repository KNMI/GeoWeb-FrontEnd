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
    const { startMoment, endMoment, zoomed } = this.props;

    return <Row>
      <Col>
        StartMoment: {startMoment.format('HH')}
      </Col>
      <Col>
        EndMoment: {endMoment.format('HH')}
      </Col>
      <Col>
        {zoomed}
      </Col>
    </Row>;
  }
}

TimeSchedule.defaultProps = {
  zoomed: false,
  startMoment: moment().add(-1, 'hour'),
  endMoment: moment().add(1, 'hour')
};

TimeSchedule.propTypes = {
  zoomed: PropTypes.bool,
  startMoment: MomentPropTypes.momentObj,
  endMoment: MomentPropTypes.momentObj
};

export default TimeSchedule;
