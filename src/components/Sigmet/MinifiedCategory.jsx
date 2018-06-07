import React, { PureComponent } from 'react';
import { Col, Badge, Card, CardHeader } from 'reactstrap';
import Icon from 'react-fa';
import PropTypes from 'prop-types';

class MinifiedCategory extends PureComponent {
  render () {
    const { icon, sigmetCount } = this.props;
    return <Card className='SigmetsCategory row accordion minified'>
      <Col>
        <CardHeader className='row'>
          <Col>
            <Icon name={icon} />
            {sigmetCount > 0
              ? <Badge color='danger' pill>{sigmetCount}</Badge>
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
