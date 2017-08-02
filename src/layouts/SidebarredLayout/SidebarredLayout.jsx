import React, { Component } from 'react';
import { Col } from 'reactstrap';
export default class SidebarredLayout extends Component {
  render () {
    const { route } = this.props;
    const { leftSidebar, secondLeftSidebar, rightSidebar } = route;
    return (
      <div style={{ flex: 1 }}>
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
        <Col className='MainViewport'>
          {this.props.children}
        </Col>
        {rightSidebar
          ? <Col xs='auto' className='RightSideBar' tag='aside'>
            {rightSidebar}
          </Col>
          : null}

      </div>
    );
  }
}
