import React, { Component, PropTypes } from 'react';
import { Button, Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import { Link } from 'react-router';
import Icon from 'react-fa';
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import CollapseOmni from '../components/CollapseOmni';
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
                icon={item.icon} notifications={item.notifications} link={item.link} tasks={item.tasks} source={item.source} />)}
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

SigmetsContainer.propTypes = {
  title: PropTypes.string
};

class SigmetCategory extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.getExistingSigmets = this.getExistingSigmets.bind(this);
    this.gotExistingSigmetsCallback = this.gotExistingSigmetsCallback.bind(this);
    this.state = { isOpen: props.isOpen, list: [] };
  }

  toggle () {
    this.setState({ isOpen: !this.state.isOpen });
  }

  getExistingSigmets (sourceUrl) {
    axios({
      method: 'get',
      url: sourceUrl,
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.gotExistingSigmetsCallback(src);
    }).catch(error => {
      this.gotExistingSigmetsCallback(error.response.data.message);
    });
  }

  gotExistingSigmetsCallback (message) {
    this.setState({ list: message && message.data ? message.data : [] });
  }

  componentWillMount () {
    this.getExistingSigmets(this.props.source);
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ isOpen: nextProps.isOpen });
  }

  render () {
    const { title, notifications, icon, link, parentCollapsed } = this.props;
    return (
      <Card className='row accordion'>
        {parentCollapsed ? <CardHeader>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col xs='auto'>&nbsp;</Col>
          <Col xs='auto'>
            {notifications > 0 ? <Badge color='danger'>{notifications}</Badge> : null}
          </Col>
        </CardHeader>
        : <CardHeader onClick={this.toggle} title={title}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col style={{ marginLeft: '0.9rem' }}>
            {title}
          </Col>
          <Col xs='auto'>
            {notifications > 0 ? <Badge color='danger'>{notifications}</Badge> : null}
          </Col>
          <Col xs='auto'>
            <Link to={link} className='row'>
              <Button outline color='info' disabled={typeof link === 'undefined'}>
                <Icon name='caret-right' />
              </Button>
            </Link>
          </Col>
        </CardHeader>}
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={this.state.list ? 80 * this.state.list.length : 0}>
          <CardBlock>
            {this.state.list ? this.state.list.map((item, i) =>
              <Row key={item.uuid} style={{ flexDirection: 'row' }}>
                <Col xs='auto'>{item.phenomenon}</Col>
                <Col xs='auto'>{item.firname}</Col>
                <Col xs='auto'>{item.validdate}</Col>
                <Col xs='auto'>{item.issuedate}</Col>
              </Row>
            ) : ''}
          </CardBlock>
        </CollapseOmni>
      </Card>
    );
  }
}

SigmetCategory.propTypes = {
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  notifications : PropTypes.number,
  icon          : PropTypes.string,
  link          : PropTypes.string,
  source        : PropTypes.string,
  parentCollapsed : PropTypes.bool
};

export default SigmetsContainer;
