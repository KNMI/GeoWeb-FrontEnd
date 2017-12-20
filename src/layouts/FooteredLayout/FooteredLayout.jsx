import React, { Component } from 'react';
import { Row } from 'reactstrap';
export default class WithSidebars extends Component {
  render () {
    const { route } = this.props;
    const { viewComponent, contextComponent } = route;
    return (
      <div style={{ flex: 1, flexDirection: 'column' }}>
        <Row className='map' tag='main'>
          {this.props.children}
        </Row>
        { contextComponent
          ? <Row className='Footer'>
            {contextComponent}
          </Row>
          : null }
      </div>
    );
  }
}
