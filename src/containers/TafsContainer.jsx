import React, { Component } from 'react';
import { Button, Col, Row, Card, CardHeader, Badge, Label, Input } from 'reactstrap';
import { Icon } from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import Panel from '../components/Panel';
import Taf from '../components/Taf/Taf';
import moment from 'moment';
import { hashHistory } from 'react-router';
let ITEMS;

export default class TafsContainer extends Component {
  constructor (props) {
    super(props);
    ITEMS = [
      {
        title: 'Open active TAFs',
        ref:   'active-tafs',
        icon: 'folder-open',
        source: this.props.urls.BACKEND_SERVER_URL + '/tafs?active=true',
        editable: false,
        tafEditable: false,
        isOpenCategory: false
      }, {
        title: 'Open concept TAFs',
        ref:   'concept-tafs',
        icon: 'folder-open-o',
        source: this.props.urls.BACKEND_SERVER_URL + '/tafs?active=false&status=concept',
        editable: false,
        tafEditable: true,
        isOpenCategory: false
      }, {
        title: 'Create new TAF',
        ref:   'add-taf',
        icon: 'star-o',
        editable: true,
        tafEditable: true,
        isOpenCategory: true
      }
    ];

    let isOpenCategory = {};
    ITEMS.forEach((item, index) => {
      isOpenCategory[item.ref] = item.isOpenCategory;
    });
    this.state = {
      isOpen: true,
      isOpenCategory: isOpenCategory,
      isFixed: true
    };
    this.toggle = this.toggle.bind(this);
    this.toggleCategory = this.toggleCategory.bind(this);
  }

  toggle () {
    /* Toggles expand left /right of TAF product panel */
    this.setState({ isOpen: !this.state.isOpen });
  }

  toggleCategory (category) {
    let isOpenCategory = Object.assign({}, this.state.isOpenCategory);
    isOpenCategory[category] = !this.state.isOpenCategory[category];
    this.setState({ isOpenCategory: isOpenCategory });
  }

  render () {
    // TODO FIX this in a better way
    let maxSize = parseInt(screen.width);
    if (document.getElementsByClassName('RightSideBar')[0]) {
      maxSize -= 2 * document.getElementsByClassName('RightSideBar')[0].clientWidth;
      maxSize += 10;
    }

    return (
      <Col className='TafsContainer'>
        <Panel className='Panel'>
          <Row style={{ marginBottom: '0.7rem' }}>
            <Col xs='auto'>
              <Button onClick={() => hashHistory.push('/')} color='primary' style={{ marginRight: '0.33rem' }}><Icon name={'times'} /></Button>
            </Col>
            <Col xs='auto'>
              <Label check style={{ paddingTop: '0.66rem' }} >
                <Input type='checkbox' checked={this.state.isFixed} onChange={() => this.setState({ isFixed: !this.state.isFixed })} />{' '}
                  Fixed table
              </Label>
            </Col>
          </Row>
          <Col style={{ flexDirection: 'column' }}>
            {ITEMS.map((item, index) => {
              return <Card className='row accordion' key={index} >

                {!this.state.isOpen
                  ? <CardHeader >
                    <Col xs='auto'>
                      <Icon name={item.icon} />
                    </Col>
                    <Col xs='auto'>&nbsp;</Col>
                    <Col xs='auto'>
                      {item.notifications > 0 ? <Badge color='danger' pill className='collapsed'>{item.notifications}</Badge> : null}
                    </Col>
                  </CardHeader>
                  : <CardHeader className={maxSize > 0 ? null : 'disabled'} onClick={() => { this.toggleCategory(item.ref); }}>
                    <Col xs='auto'>
                      <Icon name={item.icon} />
                    </Col>
                    <Col style={{ marginLeft: '0.9rem' }}>
                      {item.title}
                    </Col>
                    <Col xs='auto'>
                      {item.notifications > 0 ? <Badge color='danger' pill>{item.notifications}</Badge> : null}
                    </Col>
                  </CardHeader>
                }
                { this.state.isOpenCategory[item.ref]
                  ? <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={maxSize}>
                    <Taf urls={this.props.urls} {...item} latestUpdateTime={moment.utc()} updateParent={() => this.forceUpdate()} fixedLayout={this.state.isFixed} />
                  </CollapseOmni> : ''
                }
              </Card>;
            }
            )}
          </Col>
        </Panel>
      </Col>);
  }
}
