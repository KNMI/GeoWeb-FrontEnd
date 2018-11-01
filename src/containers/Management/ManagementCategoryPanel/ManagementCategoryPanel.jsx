import React, { PureComponent } from 'react';
import { Row, Col, Button } from 'reactstrap';
import { Link } from 'react-router';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';

import Panel from '../../../components/Panel';
import { CategoryCardLayout } from '../../../layouts';

export default class ManagementCategoryPanel extends PureComponent {
  render () {
    const { categoryConfig } = this.props;
    const { items, linkPrefix } = categoryConfig;
    return (
      <Panel className='ManagementCategoryPanel'>
        <Col>
          <Row className='grid'>
            {items.map((item, index) =>
              <CategoryCardLayout key={`categoryCard-${index}`}>
                <span data-role='name'>{item.title}</span>
                <span data-role='description'>{item.text}</span>
                <Row data-role='actions'>
                  <Col />
                  <Col xs='auto'>
                    <Button tag={Link} to={`${linkPrefix}${item.link}`} color='secondary' disabled={item.disabled}>
                      <Icon name='pencil' /> Edit
                    </Button>
                  </Col>
                </Row>
              </CategoryCardLayout>
            )}
          </Row>
          <Row />
        </Col>
      </Panel>
    );
  }
}

ManagementCategoryPanel.propTypes = {
  categoryConfig: PropTypes.shape({
    linkPrefix:  PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])))
  })
};
