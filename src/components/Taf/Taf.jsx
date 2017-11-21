import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Card, CardTitle, CardText, Button, ButtonGroup } from 'reactstrap';
import CollapseOmni from '../CollapseOmni';
import moment from 'moment';
import axios from 'axios';
import TafCategory from './TafCategory';
/*
  Renders multiple TafCategories, provides additional functions for loading and saving, and has functions for filtering on type and status.
*/
export default class Taf extends Component {
  constructor () {
    super();
    this.deleteTAF = this.deleteTAF.bind(this);
    this.fetchTAFs = this.fetchTAFs.bind(this);
    this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
    this.state = {
      tafs: [],
      expandedTAF: null,
      expandedTAC: null,
      expandedJSON: null,
      tafTypeSelections: []
    };
  }
  componentWillMount () {
    this.fetchTAFs();
  }

  componentWillReceiveProps (nextprops, nextstate) {
    if (this.props.latestUpdateTime !== nextprops.latestUpdateTime) {
      if (this.props.title === 'Open concept TAFs') {
        this.fetchTAFs();
      }
    }
  }

  fetchTAFs (url) {
    if (!(url || this.props.source)) return;
    axios({
      method: 'get',
      url: url || this.props.source,
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      if (src.data && src.data.tafs) {
        this.setState({ tafs: src.data.tafs });
      }
    }).catch(error => {
      console.error(error);
    });
  }

  deleteTAF (uuid) {
    axios({
      method: 'delete',
      url: TAFS_URL + '/tafs/' + uuid,
      responseType: 'json'
    }).then(src => {
      this.fetchTAFs();
    }).catch(error => {
      console.error(error);
    });
  }

  setExpandedTAF (uuid) {
    // Clicking the already expanded TAF collapses it
    // if (this.state.expandedTAF === uuid) {
    //   this.setState({ expandedTAF: null, expandedTAC: null });
    // } else
    if (uuid === 'edit') {
      this.setState({ expandedTAF: 'edit', expandedTAC: null });
    } else {
      // Selecting a new or another TAF, loads its TAC and sets it to expanded
      axios({
        method: 'get',
        url: TAFS_URL + '/tafs/' + uuid,
        withCredentials: true,
        responseType: 'text',
        headers: { 'Accept': 'text/plain' }
      }).then(src => this.setState({ expandedTAF: uuid, expandedTAC: src.data }));
      axios({
        method: 'get',
        url: TAFS_URL + '/tafs/' + uuid,
        withCredentials: true,
        responseType: 'json',
        headers: { 'Accept': 'application/json' }
      }).then(src => {
        this.setState({ expandedTAF: uuid, expandedJSON: src.data });
      }
      );
    }
  }

  onCheckboxBtnClick (selected) {
    const index = this.state.tafTypeSelections.indexOf(selected);
    if (index < 0) {
      this.state.tafTypeSelections.push(selected);
    } else {
      this.state.tafTypeSelections.splice(index, 1);
    }
    this.setState({ tafTypeSelections: [...this.state.tafTypeSelections] });
  }
  render () {
    if (this.state.tafs) {
      return <Col style={{ flexDirection: 'column' }}>
        { !this.props.editable
          ? <ButtonGroup style={{ marginTop: '.1rem' }}>
            <Button className='col btn btn-info' color='info' onClick={() => this.onCheckboxBtnClick('NORMAL')}
              active={this.state.tafTypeSelections.includes('NORMAL')}>ORG</Button>
            <Button className='col btn btn-info' color='info' onClick={() => this.onCheckboxBtnClick('AMENDMENT')}
              active={this.state.tafTypeSelections.includes('AMENDMENT')}>AMD</Button>
            <Button className='col btn btn-info' color='info' onClick={() => this.onCheckboxBtnClick('CORRECTION')}
              active={this.state.tafTypeSelections.includes('CORRECTION')}>COR</Button>
            <Button className='col btn btn-info' color='info' onClick={() => this.onCheckboxBtnClick('RETARDED')}
              active={this.state.tafTypeSelections.includes('RETARDED')}>RTD</Button>
            <Button className='col btn btn-info' color='info' onClick={() => this.onCheckboxBtnClick('CANCEL')}
              active={this.state.tafTypeSelections.includes('CANCEL')}>CNL</Button>
            <Button className='col btn btn-info' color='info' onClick={() => this.onCheckboxBtnClick('MISSING')}
              active={this.state.tafTypeSelections.includes('MISSING')}>NIL</Button>
          </ButtonGroup>
          : null }
        {
          this.props.editable
            ? <Card block onClick={() => this.setExpandedTAF('edit')}>
              <Row>
                <Col>
                  <TafCategory
                    taf={this.state.inputValueJSON}
                    update editable={this.props.tafEditable}
                  />
                </Col>
              </Row>
            </Card>
            : this.state.tafs.filter((taf) => this.state.tafTypeSelections.includes(taf.type) || this.state.tafTypeSelections.length === 0).map((taf, index) => {
              return <Card key={index} block onClick={() => this.setExpandedTAF(taf.metadata.uuid)}>
                <CardTitle>
                  {taf.metadata ? taf.metadata.location : 'EWat?'} - {moment.utc(taf.metadata.validityStart).format('DD/MM/YYYY - HH:mm UTC')}
                </CardTitle>
                <CollapseOmni className='CollapseOmni' style={{ flexDirection: 'column' }} isOpen={this.state.expandedTAF === taf.metadata.uuid} minSize={0} maxSize={800}>
                  <Row>
                    <Col>
                      <CardText onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>{this.state.expandedTAC}</CardText>
                    </Col>
                  </Row>
                  {taf.metadata.status === 'concept'
                    ? <Row>
                      <Col />
                      <Col xs='auto'>
                        <a href={BACKEND_SERVER_URL + '/tafs/' + taf.metadata.uuid} target='_blank'>
                          <Button color='primary'>Show IWXXM</Button>
                        </a>
                      </Col>
                      <Col xs='auto'>
                        <Button onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.deleteTAF(taf.metadata.uuid); }} color='danger'>Delete</Button>
                      </Col>
                    </Row> : null }
                  <Row>
                    <Col>
                      <TafCategory
                        taf={this.state.expandedJSON}
                        editable={this.props.tafEditable}
                      />
                    </Col>
                  </Row>
                </CollapseOmni>
              </Card>;
            })
        }
      </Col>
      ;
    } else {
      return <div />;
    }
  }
}

Taf.propTypes = {
  editable: PropTypes.bool,
  tafEditable: PropTypes.bool,
  // isOpen: PropTypes.bool,
  source: PropTypes.string,
  latestUpdateTime: PropTypes.object,
  title: PropTypes.string
  // ,  updateParent: PropTypes.func
};
