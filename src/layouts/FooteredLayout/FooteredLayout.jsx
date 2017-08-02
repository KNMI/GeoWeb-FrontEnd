import React, { Component } from 'react';
import { Row } from 'reactstrap';
export default class WithSidebars extends Component {
  render () {
    const { route } = this.props;
    const { viewComponent, contextComponent } = route;
    return (
      <div style={{ flex: 1, flexDirection: 'column' }}>
        {viewComponent
          ? <Row className='map' tag='main'>
            {viewComponent}
          </Row>
          : null }
        { contextComponent
          ? <Row className='Footer'>
            {contextComponent}
          </Row>
          : null }
        {this.props.children}
      </div>
    );
  }
}
