import React, { PureComponent } from 'react';
import { Button, Row } from 'reactstrap';
import Icon from 'react-fa';
import { hashHistory } from 'react-router';

class ContainerHeader extends PureComponent {
  render () {
    return <Row className='ContainerHeader'>
      <Button
        color='primary'
        onClick={() => hashHistory.push('/')}
        title='Close TAFs panel' >
        <Icon name={'times'} />
      </Button >
    </Row >;
  }
}

export default ContainerHeader;
