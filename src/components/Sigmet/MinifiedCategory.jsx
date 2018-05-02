import React, { PureComponent } from 'react';
import { Col, Badge, Card, CardHeader } from 'reactstrap';
import Icon from 'react-fa';
import PropTypes from 'prop-types';

class MinifiedCategory extends PureComponent {
  render () {
    const { icon, sigmetCount } = this.props;
    return <Card className='SigmetsCategory row accordion'>
      <Col>
        <CardHeader className='row'>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col xs='auto'>
            {sigmetCount > 0
              ? <Badge color='danger' pill className='minified'>{sigmetCount}</Badge>
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
  sigmetCount: PropTypes.number
};

export default MinifiedCategory;
