import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

export default class TacView extends PureComponent {
  render () {
    const { TAC } = this.props;

    return <Row className='TacView'>
      <Col xs='6'>
        <Row>
          <Col xs='1'>
            TAC
          </Col>
        </Row>
        {TAC ? TAC.split('\n').map((tacLine, i) => (<Row key={i}><Col xs='auto'>{tacLine}</Col></Row>)) : <i>...</i>}
      </Col>
    </Row>;
  }
}

TacView.propTypes = {
  TAC: PropTypes.string
};
