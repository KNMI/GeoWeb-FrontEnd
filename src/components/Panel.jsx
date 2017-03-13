import React, { Component, PropTypes } from 'react';
import { Row } from 'reactstrap';

class Panel extends Component {
  render () {
    const { title } = this.props;
    return (
      <div className='Panel'>
        <Row className='title'>
          <span>Location for panel title:</span>
          {title || 'Oops'}
        </Row>
        <Row className='content'>
          {this.props.children}
        </Row>
      </div>
    );
  }
}

Panel.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.element
};

export default Panel;
