import React, { Component, PropTypes } from 'react';
import { Container, Row, Col } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';
import '../../styles/core.scss';

class BaseLayout extends Component {
  render () {
    const { header, leftSideBar, mainViewport, rightSideBar } = this.props;
    return (
      <Container fluid style={{ minHeight: '100%' }}>
        {/*<Row className='Header' style={{ maxHeight: '0' }}>
          {header || 'Oops'}
        </Row>*/}
        <Row style={{ minHeight: '100%', flex: 1 }}>
          {/*<Col xs='3' className='LeftSideBar' style={{ maxHeight: '0' }}>
            {leftSideBar || 'Oops'}
          </Col>*/}
          <Col xs='auto' className='MainViewport' style={{ minHeight: '100%' }}>
            {mainViewport || 'Oops'}
          </Col>
          {/*<Col xs='3' className='RightSideBar' style={{ maxHeight: '0' }}>
            {rightSideBar || 'Oops'}
          </Col>*/}
        </Row>
      </Container>
    );
  }
}
BaseLayout.propTypes = {
  header: PropTypes.element,
  leftSideBar: PropTypes.element,
  mainViewport: PropTypes.element,
  rightSideBar: PropTypes.element
};

export default BaseLayout;
