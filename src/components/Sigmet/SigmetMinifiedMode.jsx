import React, { PureComponent } from 'react';
import { Button, Col, Row, Badge } from 'reactstrap';
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import HeaderSection from './Sections/HeaderSection';

const DATE_TIME_FORMAT_1 = 'DD MMM YYYY, HH:mm';
const DATE_TIME_FORMAT_2 = 'HH:mm UTC';

class SigmetMinifiedMode extends PureComponent {
  render () {
    const { dispatch, actions, uuid, phenomenon, validdate, validdateEnd, tac, isCancelFor } = this.props;
    return <Button tag='div' className={`Sigmet minified row`} onClick={(evt) => dispatch(actions.focusSigmetAction(evt, uuid))}>
      <Col>
        <HeaderSection type={phenomenon} isCancelFor={isCancelFor} />
        <Row>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge color='success'>Valid</Badge>
          </Col>
          <Col xs='9'>
            <Moment format={DATE_TIME_FORMAT_1} date={validdate} data-field='validdate' utc />
            <span>-</span>
            <Moment format={DATE_TIME_FORMAT_2} date={validdateEnd} data-field='validdate_end' utc />
          </Col>
        </Row>
        <Row>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge color='success'>TAC</Badge>
          </Col>
          <Col xs='9'>
            <span className='tac' data-field='tac' title={tac && tac.code}>{tac && tac.code}</span>
          </Col>
        </Row>
      </Col>
    </Button>;
  }
}

SigmetMinifiedMode.propTypes = {
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    focusSigmetAction: PropTypes.func
  }),
  uuid: PropTypes.string,
  tac: PropTypes.shape({
    uuid: PropTypes.string,
    code: PropTypes.string
  }),
  phenomenon: PropTypes.string,
  validdate: PropTypes.string,
  validdateEnd: PropTypes.string,
  isCancelFor: PropTypes.number
};

export default SigmetMinifiedMode;
