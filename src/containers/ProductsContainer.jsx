import React, { Component, PropTypes } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import ProductCategory from '../components/ProductCategory';
import Panel from '../components/Panel';

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
    title: 'SIGMETs',
    ref:   'sigmets',
    icon:  'plane',
    link: 'products/sigmets'
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

  toggle (evt) {
    this.setState({ isOpen: !this.state.isOpen });
    evt.preventDefault();
  }

  render () {
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
  title: PropTypes.string
};

export default ProductsContainer;
