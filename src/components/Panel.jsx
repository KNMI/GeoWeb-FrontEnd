import React, { Component, PropTypes } from 'react';
import { Row } from 'reactstrap';

class Panel extends Component {
  render () {
    const { title } = this.props;
    if (!title) {
      return (
        <div className='Panel'>
          <Row className='title notitle' />
          <Row className='content notitle'>
            {this.props.children}
          </Row>
        </div>
      );
    } else {
      return (
        <div className='Panel'>
          <Row className='title'>
            {title || 'Oops'}
          </Row>
          <Row className='content'>
            {this.props.children}
          </Row>
        </div>
      );
    }
  }
}

Panel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
};

export default Panel;
