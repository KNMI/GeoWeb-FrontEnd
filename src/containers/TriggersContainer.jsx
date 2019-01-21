import React, { Component } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import TriggerCreateCategory from '../components/Triggers/TriggerCreateCategory';
import TriggerActiveCategory from '../components/Triggers/TriggerActiveCategory';
// import TriggerInactiveCategory from '../components/Triggers/TriggerInactiveCategory';
import Panel from '../components/Panel';
import cloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import PropTypes from 'prop-types';
import { hashHistory } from 'react-router';
import axios from 'axios';

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

class TriggersContainer extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    this.getActiveTriggers = this.getActiveTriggers.bind(this);
    this._getActiveTriggersTimer = this._getActiveTriggersTimer.bind(this);
    this.getActiveTriggersOnChange = this.getActiveTriggersOnChange.bind(this);
    let isOpenCategory = {};
    ITEMS.forEach((item, index) => {
      isOpenCategory[item.ref] = false;
    });
    this.state = {
      isOpen: true,
      selectedItem: {},
      isOpenCategory: isOpenCategory,
      latestUpdateTime: moment().utc().format(),
      activeTriggersList: []
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

  componentDidMount () {
    this.getActiveTriggers();
  }

  getActiveTriggers () {
    if (this.getIntervalTimerIsRunning) {
    } else {
      this.getIntervalTimerIsRunning = true;
      this._getActiveTriggersTimer();
    }
  }

  _getActiveTriggersTimer () {
    if (!this.props.urls) {
      this.getIntervalTimerIsRunning = false;
      return;
    }
    axios({
      method: 'get',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/gettriggers'
    }).then((res) => {
      this.setState({ activeTriggersList: res.data });
    }).catch((error) => {
      console.error(error);
    }).finally(() => {
      setTimeout(this._getActiveTriggersTimer, 60000);
    });
  }

  getActiveTriggersOnChange () {
    axios({
      method: 'get',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/gettriggers'
    }).then((res) => {
      this.setState({ activeTriggersList: res.data });
    }).catch((error) => {
      console.error(error);
    });
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
    const { activeTriggersList } = this.state;
    const { urls } = this.props;
    let title = <Row>
      <Button color='primary' onClick={this.toggle} title={this.state.isOpen ? 'Collapse panel' : 'Expand panel'}>
        <Icon name={this.state.isOpen ? 'angle-double-left' : 'angle-double-right'} />
      </Button>
      <Button color='primary' onClick={() => hashHistory.push('/')} title='Close Trigger panel' style={{ marginLeft: '0.3rem' }}>
        <Icon name={'times'} />
      </Button>
    </Row>;
    const maxSize = 500;
    return (
      <Col className='TriggersTestContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={title}>
            <Col xs='auto' className='accordionsWrapper' style={{ minWidth: maxSize - 32 }}>
              {ITEMS.map((item, index) => {
                if (item.title === 'Create trigger') {
                  return <TriggerCreateCategory
                    key={index} onClick={this.toggle} title={item.title} parentCollapsed={!this.state.isOpen}
                    icon={item.icon} source={item.source} isOpen={this.state.isOpen && this.state.isOpenCategory[item.ref]}
                    dispatch={this.props.dispatch} urls={urls} getActiveTriggersOnChange={() => this.getActiveTriggersOnChange()}
                    selectMethod={(index, geo) => this.select(item.ref, index, geo)} toggleMethod={() => this.toggleCategory(item.ref)} />;
                } else if (item.title === 'Active triggers') {
                  return <TriggerActiveCategory
                    key={index} onClick={this.toggle} title={item.title} parentCollapsed={!this.state.isOpen}
                    icon={item.icon} source={item.source} isOpen={this.state.isOpen && this.state.isOpenCategory[item.ref]}
                    dispatch={this.props.dispatch} urls={urls} activeTriggersList={activeTriggersList} getActiveTriggersOnChange={() => this.getActiveTriggersOnChange()}
                    selectMethod={(index, geo) => this.select(item.ref, index, geo)} toggleMethod={() => this.toggleCategory(item.ref)} />;
                // } else if (item.title === 'Inactive triggers') {
                //   return <TriggerInactiveCategory
                //     key={index} onClick={this.toggle} title={item.title} parentCollapsed={!this.state.isOpen}
                //     icon={item.icon} source={item.source} isOpen={this.state.isOpen && this.state.isOpenCategory[item.ref]}
                //     dispatch={this.props.dispatch} urls={urls}
                //     selectMethod={(index, geo) => this.select(item.ref, index, geo)} toggleMethod={() => this.toggleCategory(item.ref)} />;
                // }
                }
              })}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

TriggersContainer.propTypes = {
  dispatch: PropTypes.func,
  urls: PropTypes.object
};

export default TriggersContainer;
