import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class FirSection extends PureComponent {
  render () {
    const children = {};
    this.props.children.forEach(child => {
      if (child && child.props) {
        children[child.props['data-field']] = child;
      }
    });
    return <Row className='Where'>
      <Col>
        <Row>
          <Col xs='3'>
            <Badge color='success'>Where</Badge>
          </Col>
          <Col xs='9'>
            {children.firname}
            {children.firname && children.firname.props.selected
              ? <span className={children.firname.props.selected.length > 0 ? 'required' : 'required missing'} />
              : null
            }
          </Col>
        </Row>
        <Row>
          <Col xs={{ size: 9, offset: 3 }}>
            {children.location_indicator_icao}
          </Col>
        </Row>
      </Col>
    </Row>;
  }
}

FirSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};
