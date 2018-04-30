import React, { PureComponent } from 'react';
import { Button, Col, Row, Badge } from 'reactstrap';
import Phenomenon from './Components/Phenomenon';

class SigmetInstance extends PureComponent {
  render () {
    return <Button tag='div' className={'Sigmet row'}>
      <Row>
        <Col xs='3'>
          <Badge color='success'>What</Badge>
        </Col>
        <Col xs='9'>
          <Phenomenon />
        </Col>
      </Row>
    </Button>;
  }
}

SigmetInstance.propTypes = {

};

export default SigmetInstance;
