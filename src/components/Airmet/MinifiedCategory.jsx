import React, { PureComponent } from 'react';
import { Col, Badge, Card, CardHeader } from 'reactstrap';
import Icon from 'react-fa';
import PropTypes from 'prop-types';

class MinifiedCategory extends PureComponent {
  render () {
    const { icon, airmetCount } = this.props;
    return <Card className='AirmetsCategory row accordion minified'>
      <Col>
        <CardHeader className='row'>
          <Col>
            <Icon name={icon} />
            {airmetCount > 0
              ? <Badge color='danger' pill>{airmetCount}</Badge>
              : null
            }
          </Col>
        </CardHeader>
      </Col>
    </Card>;
  }
}

MinifiedCategory.propTypes = {
  icon: PropTypes.string,
  airmetCount: PropTypes.number
};

export default MinifiedCategory;
