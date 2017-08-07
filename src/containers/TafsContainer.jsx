import React, { Component } from 'react';
import { Button, Col, Row, Card, CardHeader, Badge } from 'reactstrap';
import { Icon } from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import Panel from '../components/Panel';

import { BACKEND_SERVER_URL } from '../constants/backend';

const GET_TAFS_URL = BACKEND_SERVER_URL + '/taf/gettaflist?';
const SET_TAF_URL = BACKEND_SERVER_URL + '/taf/storetaf';
const ITEMS = [
  {
    title: 'Open valid TAFs',
    ref:   'active-tafs',
    icon: 'folder-open',
    source: GET_TAFS_URL + 'active=true',
    editable: false
  },
  {
    title: 'Open archived TAFs',
    ref:  'archived-tafs',
    icon: 'archive',
    source: GET_TAFS_URL + 'active=false&status=EXPIRED',
    editable: false
  },
  {
    title: 'Open concept TAFs',
    ref:   'concept-tafs',
    icon: 'folder-open-o',
    source: GET_TAFS_URL + 'active=false&status=CONCEPT',
    editable: false
  },
  {
    title: 'Create new TAF',
    ref:   'add-taf',
    icon: 'star-o',
    source: SET_TAF_URL,
    editable: true
  }
];

export default class TafsContainer extends Component {
  constructor () {
    super();
    this.state = {
      isOpen: true
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle () {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render () {
    const maxSize = 400;
    let title = <Row>
      <Button color='primary' onClick={this.toggle} title={this.state.isOpen ? 'Collapse panel' : 'Expand panel'}>
        <Icon name={this.state.isOpen ? 'angle-double-left' : 'angle-double-right'} />
      </Button>
    </Row>;
    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={title}>
            <Col xs='auto' className='accordionsWrapper' style={{ minWidth: maxSize - 32 }}>
              {ITEMS.map((item, index) =>
                <Card className='row accordion'>

                  {!this.state.isOpen ? <CardHeader>
                    <Col xs='auto'>
                      <Icon name={item.icon} />
                    </Col>
                    <Col xs='auto'>&nbsp;</Col>
                    <Col xs='auto'>
                      {item.notifications > 0 ? <Badge color='danger' pill className='collapsed'>{item.notifications}</Badge> : null}
                    </Col>
                  </CardHeader>
                  : <CardHeader className={maxSize > 0 ? null : 'disabled'} title={title}>
                    <Col xs='auto'>
                      <Icon name={item.icon} />
                    </Col>
                    <Col style={{ marginLeft: '0.9rem' }}>
                      {item.title}
                    </Col>
                    <Col xs='auto'>
                      {item.notifications > 0 ? <Badge color='danger' pill>{item.notifications}</Badge> : null}
                    </Col>
                  </CardHeader>}
                  <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={maxSize}>
                    TODO
                  </CollapseOmni>
                </Card>
            )}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>);
  }
}
