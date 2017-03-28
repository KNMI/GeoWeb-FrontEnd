import React, { Component, PropTypes } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import cloneDeep from 'lodash/cloneDeep';
import CollapseOmni from '../components/CollapseOmni';
import SigmetCategory from '../components/SigmetCategory';
import Panel from '../components/Panel';
import { BACKEND_SERVER_URL } from '../routes/ADAGUC/constants/backend';

const sigmetsUrl = BACKEND_SERVER_URL + '/sigmet/getsigmetlist?';
const items = [
  {
    title: 'Open issued SIGMETs',
    icon: 'folder-open',
    source: sigmetsUrl + 'active=true'
  },
  {
    title: 'Open concept SIGMETs',
    icon: 'folder-open-o',
    source: sigmetsUrl + 'active=false&status=production'
  },
  {
    title: 'Create new SIGMET',
    icon: 'star-o'
  }
];

class SigmetsContainer extends Component {
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
    const hasFilter = this.state.filter instanceof RegExp;
    let filteredItems = cloneDeep(items).filter(category => {
      if (hasFilter) {
        category.tasks = category.tasks.filter(item => this.state.filter.test(item.title));
        return category.tasks.length > 0 || this.state.filter.test(category.title);
      }
      return true;
    });
    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} isHorizontal minSize={64} maxSize={500}>
          <Panel className='Panel' title={title}>
            {filteredItems.map((item, index) =>
              <SigmetCategory key={index} title={item.title} isOpen={hasFilter} parentCollapsed={!this.state.isOpen}
                icon={item.icon} source={item.source} />)}
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

SigmetsContainer.propTypes = {
  title: PropTypes.string
};

export default SigmetsContainer;
