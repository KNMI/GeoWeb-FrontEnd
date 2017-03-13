import React, { Component, PropTypes } from 'react';
import { Row } from 'reactstrap';

class Panel extends Component {
  render () {
    const { title } = this.props;
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

Panel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
};

export default Panel;
