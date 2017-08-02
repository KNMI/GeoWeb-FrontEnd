import React, { Component } from 'react';
import { Row } from 'reactstrap';
export default class HeaderLayout extends Component {
  render () {
    const { route } = this.props;
    const { header } = route;
    return (
      <div className='innerContainer'>
        { header
          ? <Row className='Header' tag='header'>
            {React.cloneElement(header, this.props) || 'Oops'}
          </Row>
          : null }
        <Row className='MainSection'>
          {this.props.children}
        </Row>
      </div>
    );
  }
}
