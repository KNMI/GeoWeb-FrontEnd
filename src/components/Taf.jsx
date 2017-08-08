import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardTitle, CardText } from 'reactstrap';
import CollapseOmni from './CollapseOmni';
import moment from 'moment';
import { TAFS_URL } from '../constants/backend';
export default class Taf extends Component {
  constructor () {
    super();
    this.state = {
      tafs: [],
      expandedTAF: null,
      expandedTAC: null
    };
  }
  componentWillMount () {
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
      return <Col style={{ flexDirection: 'column' }}>
        {
          this.state.tafs.map((taf) => {
            return <Card block onClick={() => this.setExpandedTAF(taf.uuid)}>
              <CardTitle>
                {taf.previousReportAerodrome ? taf.previousReportAerodrome : 'EWat?'} - {moment.utc(taf.validityStart).format('DD/MM/YYYY - HH:mm UTC')}
              </CardTitle>
              <CollapseOmni className='CollapseOmni' isOpen={this.state.expandedTAF === taf.uuid} minSize={0} maxSize={69}>
                <CardText>{this.state.expandedTAC}</CardText>
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
