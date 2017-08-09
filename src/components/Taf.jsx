import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Col, Card, CardTitle, CardText, CardFooter, Input, Button } from 'reactstrap';
import CollapseOmni from './CollapseOmni';
import moment from 'moment';
import { TAFS_URL } from '../constants/backend';
export default class Taf extends Component {
  constructor () {
    super();
    this.deleteTAF = this.deleteTAF.bind(this);
    this.fetchTAFs = this.fetchTAFs.bind(this);
    this.state = {
      tafs: [],
      expandedTAF: null,
      expandedTAC: null,
      inputValue: ''
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
      url: url ? url : this.props.source,
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.setState({ tafs: src.data.tafs });
    }).catch(error => {
      console.error(error);
    });
  }

  deleteTAF (uuid) {
    console.log(TAFS_URL + '/tafs/' + uuid);
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
  render () {
    if (this.state.tafs) {
      return <Col style={{ flexDirection: 'column' }}>
        {
          this.props.editable
          ? <Card block onClick={() => this.setExpandedTAF('edit')}>
            <CardTitle>
              Paste a valid TAF JSON
            </CardTitle>

            <CollapseOmni className='CollapseOmni' isOpen={this.state.expandedTAF === 'edit'} minSize={0} maxSize={5000}>
              <Input onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} onChange={evt => this.updateInputValue(evt)} value={this.state.inputValue} type='textarea' name='text' id='tafInput' />
              <CardFooter onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}><Button onClick={() => this.addTaf()}>Submit</Button></CardFooter>
            </CollapseOmni>
          </Card>
          : this.state.tafs.map((taf) =>
            <Card block onClick={() => this.setExpandedTAF(taf.uuid)}>
              <CardTitle>
                {taf.previousReportAerodrome ? taf.previousReportAerodrome : 'EWat?'} - {moment.utc(taf.validityStart).format('DD/MM/YYYY - HH:mm UTC')}
              </CardTitle>
              <CollapseOmni className='CollapseOmni' isOpen={this.state.expandedTAF === taf.uuid} minSize={0} maxSize={150}>
                <CardText>{this.state.expandedTAC}</CardText>
                {taf.status === 'CONCEPT'
                  ? <CardFooter onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.deleteTAF(taf.uuid); }}>Delete</CardFooter>
                  : <div />}
              </CollapseOmni>
            </Card>
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
  source: PropTypes.string
};
