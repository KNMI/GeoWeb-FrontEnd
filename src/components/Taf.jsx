import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Col, Card, CardTitle, CardText, CardFooter, Input, Button, ButtonGroup } from 'reactstrap';
import CollapseOmni from './CollapseOmni';
import moment from 'moment';
import { TAFS_URL } from '../constants/backend';
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
    console.log('fetching tafs');
    axios({
      method: 'get',
      url: url || this.props.source,
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.setState({ tafs: src.data.tafs });
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
    if (this.state.expandedTAF === uuid) {
      this.setState({ expandedTAF: null, expandedTAC: null });
    } else if (uuid === 'edit') {
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
    }
  }

  addTaf () {
    axios({
      method: 'post',
      url: TAFS_URL + '/tafs',
      withCredentials: true,
      data: JSON.stringify(JSON.parse(this.state.inputValue)),
      headers: { 'Content-Type': 'application/json' }
    }).then(src => {
      this.setState({ inputValue: src.data.message });
      this.props.updateParent();
    });
  }
  updateInputValue (evt) {
    this.setState({
      inputValue: evt.target.value
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
              <CardTitle>
                Paste a valid TAF JSON
              </CardTitle>

              <CollapseOmni className='CollapseOmni' isOpen={this.state.expandedTAF === 'edit'} minSize={0} maxSize={200}>
                <Input onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} onChange={evt => this.updateInputValue(evt)}
                  value={this.state.inputValue} type='textarea' name='text' id='tafInput' />
                <CardFooter onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <Button color='primary' onClick={() => this.addTaf()}>Submit</Button>
                </CardFooter>
              </CollapseOmni>
            </Card>
            : this.state.tafs.filter((taf) => this.state.tafTypeSelections.includes(taf.type) || this.state.tafTypeSelections.length === 0).map((taf) =>{
              return <Card block onClick={() => this.setExpandedTAF(taf.uuid)}>
                <CardTitle>
                  {taf.previousReportAerodrome ? taf.previousReportAerodrome : 'EWat?'} - {moment.utc(taf.validityStart).format('DD/MM/YYYY - HH:mm UTC')}
                </CardTitle>
                <CollapseOmni className='CollapseOmni' isOpen={this.state.expandedTAF === taf.uuid} minSize={0} maxSize={200}>
                  <CardText onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>{this.state.expandedTAC}</CardText>
                  {taf.status === 'CONCEPT'
                    ? <CardFooter onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.deleteTAF(taf.uuid); }}>
                      <Button color='primary'>Delete</Button>
                    </CardFooter>
                    : <div />}
                </CollapseOmni>
              </Card>}
            )
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
  source: PropTypes.string,
  latestUpdateTime: PropTypes.object,
  title: PropTypes.string
};
