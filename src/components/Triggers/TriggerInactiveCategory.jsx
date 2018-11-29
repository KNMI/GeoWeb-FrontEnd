import React, { Component } from 'react';
import { Col, Badge, Card, CardHeader } from 'reactstrap';
import Icon from 'react-fa';
import PropTypes from 'prop-types';

class TriggerInactiveCategory extends Component {
  constructor (props) {
    super(props);
    this.state = {
      isOpen: props.isOpen
    };
  }

  render () {
    const { title, icon, toggleMethod } = this.props;
    let activeList = [];
    return (
      <Card className='row accordion'>
        <CardHeader onClick={activeList.length > 0 ? toggleMethod : null} className={activeList.length > 0 ? null : 'disabled'} title={title}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col style={{ marginLeft: '0.9rem' }}>
            {title}
          </Col>
          <Col xs='auto'>
            {activeList.length > 0 ? <Badge color='danger' pill>{activeList.length}</Badge> : null}
          </Col>
        </CardHeader>
      </Card>);
  }
}

TriggerInactiveCategory.propTypes = {
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  icon          : PropTypes.string,
  toggleMethod  : PropTypes.func
};

export default TriggerInactiveCategory;
