import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Col, Row, Card, CardTitle, CardText, CardFooter, Button, ButtonGroup } from 'reactstrap';
import CollapseOmni from '../CollapseOmni';
import moment from 'moment';
import { BACKEND_SERVER_URL, TAFS_URL } from '../../constants/backend';
import TafCategory from './TafCategory';
/*
  Renders multiple TafCategories, provides additional functions for loading and saving, and has functions for filtering on type and status.
*/
export default class Taf extends Component {
  constructor () {
    super();
    this.deleteTAF = this.deleteTAF.bind(this);
    this.fetchTAFs = this.fetchTAFs.bind(this);
    this.saveTaf = this.saveTaf.bind(this);
    this.validateTaf = this.validateTaf.bind(this);
    this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
    this.state = {
      tafs: [],
      expandedTAF: null,
      expandedTAC: null,
      expandedJSON: null,
      inputValue: '',
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
    axios({
      method: 'get',
      url: url || this.props.source,
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      if (src.data && src.data.tafs) {
        this.setState({ tafs: src.data.tafs });
        // this.setExpandedTAF('4bc6317f-b17b-4324-943e-dc5c44442e50');
        // this.setExpandedTAF('6f533de6-aed8-4a42-b226-0be62e37d03a');
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

  validateTaf (tafDATAJSON) {
    axios({
      method: 'post',
      url: TAFS_URL + '/tafs/verify',
      withCredentials: true,
      data: JSON.stringify(tafDATAJSON),
      headers: { 'Content-Type': 'application/json' }
    }).then(
      response => {
        console.log(response.data.errors);
        console.log(response.data.message);
        if (response.data) {
          this.setState({
            validationReport:response.data
          });
        } else {
          this.setState({
            validationReport:null
          });
        }
      }
    ).catch(error => {
      console.log(error);
      this.setState({
        validationReport:{ message: 'Invalid response from TAF verify servlet [/tafs/verify].' }
      });
    });
  }

  saveTaf (tafDATAJSON) {
    console.log('tafDATAJSON', tafDATAJSON);
    const flatten = list => list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
    );

    axios({
      method: 'post',
      url: TAFS_URL + '/tafs',
      withCredentials: true,
      data: JSON.stringify(tafDATAJSON),
      headers: { 'Content-Type': 'application/json' }
    }).then(src => {
      console.log(src.data.message);
      this.setState({ inputValue: src.data.message, validationReport:null });
      this.props.updateParent();
    }).catch(error => {
      const errors = JSON.parse(error.response.data.errors);
      console.log('Error occured', errors);
      this.setState({
        validationReport:errors
      });
      // if (error.response && error.response.status) {
      //   if (error.response.status === 400) {
      //     alert('Server code 400');
      //     return 0;
      //   };
      // }

      // const errors = JSON.parse(error.response.data.errors);
      const allErrors = flatten(Object.values(errors).filter(v => Array.isArray(v)));
      alert('TAF contains syntax errors!\n' + allErrors.join('\n'));
    });
  }

  addTaf () {
    const flatten = list => list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
    );

    axios({
      method: 'post',
      url: TAFS_URL + '/tafs',
      withCredentials: true,
      data: JSON.stringify(JSON.parse(this.state.inputValue)),
      headers: { 'Content-Type': 'application/json' }
    }).then(src => {
      this.setState({ inputValue: src.data.message, validationReport:null });
      this.props.updateParent();
    }).catch(error => {
      const errors = JSON.parse(error.response.data.errors);
      const allErrors = flatten(Object.values(errors).filter(v => Array.isArray(v)));
      alert('TAF contains syntax errors!\n' + allErrors.join('\n'));
    });
  }
  updateInputValue (evt) {
    let jsonValue = null;
    try {
      jsonValue = JSON.parse(evt.target.value);
    } catch (e) {
      console.log(e);
    }
    this.setState({
      inputValue: evt.target.value,
      inputValueJSON: jsonValue,
      validationReport:null
    });
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
                    validationReport={this.state.validationReport}
                    update editable={this.props.tafEditable}
                    saveTaf={this.saveTaf}
                    validateTaf={this.validateTaf} />
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
                      <TafCategory taf={this.state.expandedJSON} validationReport={this.state.validationReport} editable={this.props.tafEditable} saveTaf={this.saveTaf} validateTaf={this.validateTaf} />
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
  isOpen: PropTypes.bool,
  source: PropTypes.string,
  latestUpdateTime: PropTypes.object,
  title: PropTypes.string,
  updateParent: PropTypes.func
};
