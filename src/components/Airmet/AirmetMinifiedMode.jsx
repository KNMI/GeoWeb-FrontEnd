import React, { PureComponent } from 'react';
import { Button, Col, Row, Badge } from 'reactstrap';
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import { TIME_LABEL_FORMAT_UTC, DATETIME_START_FORMAT } from '../../config/DayTimeConfig';
import HeaderSection from '../SectionTemplates/HeaderSection';

class AirmetMinifiedMode extends PureComponent {
  render () {
    const { dispatch, actions, uuid, phenomenon, validdate, validdateEnd, tac, isCancelFor } = this.props;
    return <Button tag='div' className={`Airmet minified row`} onClick={(evt) => dispatch(actions.focusAirmetAction(evt, uuid))}>
      <Col>
        <HeaderSection type={phenomenon} isCancelFor={isCancelFor} label={'AIRMET'} />
        <Row>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge color='success'>Valid</Badge>
          </Col>
          <Col xs='9'>
            <Moment format={DATETIME_START_FORMAT} date={validdate} data-field='validdate' utc />
            <span>-</span>
            <Moment format={TIME_LABEL_FORMAT_UTC} date={validdateEnd} data-field='validdate_end' utc />
          </Col>
        </Row>
        <Row>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge color='success'>TAC</Badge>
          </Col>
          <Col xs='9'>
            <span className='tac' data-field='tac' title={tac}>{tac}</span>
          </Col>
        </Row>
      </Col>
    </Button>;
  }
}

AirmetMinifiedMode.propTypes = {
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    focusAirmetAction: PropTypes.func
  }),
  uuid: PropTypes.string,
  tac: PropTypes.string,
  phenomenon: PropTypes.string,
  validdate: PropTypes.string,
  validdateEnd: PropTypes.string,
  isCancelFor: PropTypes.number
};

export default AirmetMinifiedMode;
