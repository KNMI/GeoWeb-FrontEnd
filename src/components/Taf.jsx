import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Col, Card, CardTitle, CardText, CardFooter } from 'reactstrap';
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
      expandedTAC: null
    };
  }
  componentWillMount () {
    this.fetchTAFs();
  }

  fetchTAFs () {
    axios({
      method: 'get',
      url: this.props.source,
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

  render () {
    if (this.state.tafs) {
      console.log(this.state.tafs);
      return <Col style={{ flexDirection: 'column' }}>
        {
          this.state.tafs.map((taf) => {
            return <Card block onClick={() => this.setExpandedTAF(taf.uuid)}>
              <CardTitle>
                {taf.previousReportAerodrome ? taf.previousReportAerodrome : 'EWat?'} - {moment.utc(taf.validityStart).format('DD/MM/YYYY - HH:mm UTC')}
              </CardTitle>
              <CollapseOmni className='CollapseOmni' isOpen={this.state.expandedTAF === taf.uuid} minSize={0} maxSize={150}>
                <CardText>{this.state.expandedTAC}</CardText>
                {taf.status === 'CONCEPT'
                  ? <CardFooter onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.deleteTAF(taf.uuid); }}>Delete</CardFooter>
                  : <div />}
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
  source: PropTypes.string
};
