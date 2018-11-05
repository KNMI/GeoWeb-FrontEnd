import React, { Component } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import TriggerTestCategory from '../components/TriggerTestCategory';
import Panel from '../components/Panel';
import cloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import PropTypes from 'prop-types';

const ITEMS = [
  {
    title: 'Create trigger',
    ref: 'trigger-create',
    icon: 'plus'
  },
  {
    title: 'Active triggers',
    ref:   'trigger-active',
    icon: 'folder-open'
  }, {
    title: 'Inactive triggers',
    ref:   'trigger-inactive',
    icon:  'folder-open-o'
  }
];

class TriggersTestContainer extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    let isOpenCategory = {};
    ITEMS.forEach((item, index) => {
      isOpenCategory[item.ref] = false;
    });
    this.state = {
      triggers: [],
      discardedTriggers: [],
      isOpen: true,
      selectedItem: {},
      isOpenCategory: isOpenCategory,
      latestUpdateTime: moment().utc().format()
    };
  }

  toggle (evt) {
    this.setState({ isOpen: !this.state.isOpen });
    evt.preventDefault();
  }

  toggleCategory (category) {
    const newIsOpenCategory = cloneDeep(this.state.isOpenCategory);
    newIsOpenCategory[category] = !newIsOpenCategory[category];
    this.setState({ isOpenCategory: newIsOpenCategory });
  }

  select (category, index, geo) {
    if (typeof this.state.selectedItem.index !== 'undefined' &&
        this.state.selectedItem.category === category && this.state.selectedItem.index === index) {
      this.setState({ selectedItem: {} });
      return false;
    } else {
      this.setState({ selectedItem: { category: category, index: index, geojson: geo } });
      return true;
    }
  }

  render () {
    const { urls } = this.props;
    let title = <Row>
      <Button color='primary' onClick={this.toggle} title={this.state.isOpen ? 'Collapse panel' : 'Expand panel'}>
        <Icon name={this.state.isOpen ? 'angle-double-left' : 'angle-double-right'} />
      </Button>
    </Row>;
    const maxSize = 500;
    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={title}>
            <Col xs='auto' className='accordionsWrapper' style={{ minWidth: maxSize - 32 }}>
              {ITEMS.map((item, index) => {
                const data = item.title !== 'Create trigger';
                return <TriggerTestCategory
                  key={index} onClick={this.toggle} title={item.title} parentCollapsed={!this.state.isOpen}
                  icon={item.icon} source={item.source} isOpen={this.state.isOpen && this.state.isOpenCategory[item.ref]}
                  dispatch={this.props.dispatch} data={data} urls={urls}
                  selectMethod={(index, geo) => this.select(item.ref, index, geo)} toggleMethod={() => this.toggleCategory(item.ref)} />;
              })}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

TriggersTestContainer.propTypes = {
  dispatch: PropTypes.func,
  urls: PropTypes.object
};

export default TriggersTestContainer;
