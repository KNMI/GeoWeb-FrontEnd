import React, { Component, PropTypes } from 'react';
import { Button, Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import { Link } from 'react-router';
import Moment from 'react-moment';
import Icon from 'react-fa';
import axios from 'axios';
import CollapseOmni from '../components/CollapseOmni';
const timeFormat = 'YYYY MMM DD - HH:mm';
const shortTimeFormat = 'HH:mm';
const phenomenonMapping = [
  {
    'phenomenon': { 'name': 'Thunderstorm', 'code': 'TS' },
    'variants': [
      { 'name': 'Obscured', 'code': 'OBSC' },
      { 'name': 'Embedded', 'code': 'EMBD' },
      { 'name': 'Frequent', 'code': 'FRQ' },
      { 'name': 'Squall line', 'code': 'SQL' }
    ],
    'additions': [
      { 'name': 'With hail', 'code': 'GR' }
    ]
  },
  {
    'phenomenon': { 'name': 'Turbulence', 'code': 'TURB' },
    'variants': [
      { 'name': 'Severe', 'code': 'SEV' }
    ],
    'additions': []
  },
  {
    'phenomenon': { 'name': 'Icing', 'code': 'ICE' },
    'variants': [
      { 'name': 'Severe', 'code': 'SEV' }
    ],
    'additions': [
      { 'name': 'due to freezing rain', 'code': ' (FZRA)' }
    ]
  },
  {
    'phenomenon': { 'name': 'Duststorm', 'code': 'DS' },
    'variants': [
      { 'name': 'Heavy', 'code': 'HVY' }
    ],
    'additions': []
  },
  {
    'phenomenon': { 'name': 'Sandstorm', 'code': 'SS' },
    'variants': [
      { 'name': 'Heavy', 'code': 'HVY' }
    ],
    'additions': []
  },
  {
    'phenomenon': { 'name': 'Radioactive cloud', 'code': 'RDOACT CLD' },
    'variants': [],
    'additions': []
  }
];

class SigmetCategory extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.getHRS4code = this.getHRT4code.bind(this);
    this.getExistingSigmets = this.getExistingSigmets.bind(this);
    this.gotExistingSigmetsCallback = this.gotExistingSigmetsCallback.bind(this);
    this.state = { isOpen: props.isOpen, list: [] };
  }

  // get Human Readable Text for Code
  getHRT4code (code) {
    const codeFragments = code.split('_');
    let variantIndex;
    let additionIndex;

    const effectiveMapping = phenomenonMapping.map((item) => {
      if (item.variants.length > 0) {
        variantIndex = item.variants.findIndex((variant) => codeFragments[0].startsWith(variant.code));
        if (variantIndex > -1) {
          item.variants = [item.variants[variantIndex]];
          return item;
        }
      } else if (item.phenomenon.code.startsWith(codeFragments[0])) {
        return item;
      }
    }).filter((item) => typeof item !== 'undefined').filter((item) => {
      if (item.variants.length > 0) {
        return codeFragments[1].startsWith(item.phenomenon.code);
      } else {
        return true;
      }
    });/*.map((item) => {
      if (item.additions.length > 0) {
        additionIndex = item.additions.findIndex((addition) => codeFragments[1].endsWith(addition.code));
        if (additionIndex > -1) {
          item.matchedAddition = item.additions[additionIndex];
          return item;
        }
      } else {
        return item;
      }
    }).filter((item) => typeof item !== 'undefined');*/
    console.log('Mapped', effectiveMapping);
    return effectiveMapping[0].variants[0].name + ' ' + effectiveMapping[0].phenomenon.name.toLowerCase();
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
      this.gotExistingSigmetsCallback(error.response);
    });
  }

  gotExistingSigmetsCallback (message) {
    this.setState({ list: message && message.data ? message.data : [] });
    if (this.state.list.length > 0) {
      this.getHRT4code(this.state.list[0].phenomenon);
    } else {
      console.log('No list');
    }
  }

  componentWillMount () {
    this.getExistingSigmets(this.props.source);
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ isOpen: nextProps.isOpen });
  }

  render () {
    const { title, icon, parentCollapsed } = this.props;
    const notifications = this.state.list.length;
    return (
      <Card className='row accordion'>
        {parentCollapsed ? <CardHeader>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col xs='auto'>&nbsp;</Col>
          <Col xs='auto'>
            {notifications > 0 ? <Badge color='danger' pill className='collapsed'>{notifications}</Badge> : null}
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
            {notifications > 0 ? <Badge color='danger' pill>{notifications}</Badge> : null}
          </Col>
        </CardHeader>}
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={this.state.list ? 80 * this.state.list.length : 0}>
          <CardBlock>
            <Row>
              <Col className='btn-group-vertical'>
                {this.state.list ? this.state.list.map((item, i) =>
                  <Button tag='button' className='row' key={item.uuid}>
                    <Col xs='auto' style={{ paddingRight: '0.4rem' }}>
                      <Moment format={timeFormat} date={item.issuedate} />
                      <Icon name='angle-right' style={{ padding: '0 0.3rem' }} />
                      <Moment format={shortTimeFormat} date={item.validdate} />&nbsp;UTC
                    </Col>
                    <Col>
                      {item.phenomenon}
                    </Col>
                    <Col xs='auto'>
                      <Icon name='caret-right' className='icon' />
                    </Col>
                  </Button>) : ''}
              </Col>
{/*            {this.state.list ? this.state.list.map((item, i) =>
              <Row key={item.uuid} style={{ flexDirection: 'row' }}>
                <Col xs='auto'>{item.phenomenon}</Col>
                <Col xs='auto'>{item.firname}</Col>
                <Col xs='auto'>{item.validdate}</Col>
                <Col xs='auto'>{item.issuedate}</Col>
              </Row>
            ) : ''}*/}
            </Row>
          </CardBlock>
        </CollapseOmni>
      </Card>
    );
  }
}

SigmetCategory.propTypes = {
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  icon          : PropTypes.string,
  source        : PropTypes.string,
  parentCollapsed : PropTypes.bool
};

export default SigmetCategory;
