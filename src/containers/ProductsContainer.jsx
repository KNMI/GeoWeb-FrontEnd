import React, { Component } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import ProductCategory from '../components/ProductCategory';
import Panel from '../components/Panel';
import PropTypes from 'prop-types';
import { CheckIfUserHasRole } from '../utils/user';
import { hashHistory } from 'react-router';
import { UserRoleLists } from '../constants/userroles';

const ITEMS = [
  {
    title: 'Today\'s all shift products',
    ref:   'all-of-today',
    icon:  'calendar'
  },
  {
    title: 'Shared products',
    ref:   'shared',
    icon:  'share-alt'
  },
  {
    title: 'Warnings',
    ref:   'warnings',
    icon:   'exclamation-triangle'
  },
  {
    title: 'TAF',
    ref:   'TAF',
    icon:  'sun-o',
    link: 'products/tafs'
  },
  {
    title: 'SIGMETs',
    ref:   'sigmets',
    icon:  'plane',
    link: 'products/sigmets'
  },
  {
    title: 'AIRMETs',
    ref:   'airmets',
    icon:  'plane',
    link: 'products/airmets'
  },
  {
    title: 'Forecasts',
    ref:   'forecasts',
    icon:  'wpexplorer'
  },
  {
    title: 'Analysis',
    ref:   'analysis',
    icon:  'lightbulb-o'
  }
];

class ProductsContainer extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { isOpen: true };
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.state !== nextState;
  }

  toggle (evt) {
    this.setState({ isOpen: !this.state.isOpen });
    evt.preventDefault();
  }

  render () {
    const { user } = this.props;
    if (user && (!user.isLoggedIn || !CheckIfUserHasRole(user, UserRoleLists.METEOROLOGIST))) {
      hashHistory.push('/');
    }
    let title = <Row>
      <Button color='primary' onClick={this.toggle} title={this.state.isOpen ? 'Collapse panel' : 'Expand panel'}>
        <Icon name={this.state.isOpen ? 'angle-double-left' : 'angle-double-right'} />
      </Button>
    </Row>;
    return (
      <Col className='ProductsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} isHorizontal minSize={64} maxSize={300}>
          <Panel className='Panel' title={title}>
            <Col xs='auto' className='accordionsWrapper'>
              {ITEMS.map((item, index) =>
                <ProductCategory key={index} title={item.title} isOpen={this.state.isOpen} parentCollapsed={!this.state.isOpen}
                  icon={item.icon} notifications={item.notifications} link={item.link} tasks={item.tasks} />
              )}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

ProductsContainer.propTypes = {
  user: PropTypes.object
};

export default ProductsContainer;
