import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import PropTypes from 'prop-types';

class SidebarredLayout extends Component {
  render () {
    const { route } = this.props;
    const { leftSidebar, secondLeftSidebar, rightSidebar } = route;
    return (
      <Col className='sidebarredLayout'>
        <Row>
          {leftSidebar
            ? <Col xs='auto' className='LeftSideBar' tag='aside'>
              {leftSidebar}
            </Col>
            : null}
          {secondLeftSidebar
            ? <Col xs='auto' className='SecondLeftSideBar' tag='aside'>
              {secondLeftSidebar}
            </Col>
            : null}
          <Col className='sidebarredContent'>
            {this.props.children}
          </Col>
          {rightSidebar
            ? <Col xs='auto' className='RightSideBar' tag='aside'>
              {rightSidebar}
            </Col>
            : null}
        </Row>
      </Col>
    );
  }
}

SidebarredLayout.propTypes = {
  route: PropTypes.shape({
    footer: PropTypes.element
  }),
  children: PropTypes.element
};

export default SidebarredLayout;
