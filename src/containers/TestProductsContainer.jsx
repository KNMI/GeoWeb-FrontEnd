import React, { Component, PureComponent } from 'react';
import { Button, Col, Row, Alert } from 'reactstrap';
import Icon from 'react-fa';
import Panel from '../components/Panel';
import { hashHistory } from 'react-router';
import PropTypes from 'prop-types';
import axios from 'axios';
import ExportedProductsComponent from '../components/ExportedProductsComponent';
import '../styles/testproducts.scss';

class ContainerHeader extends PureComponent {
  render () {
    return <Row className='ContainerHeader'>
      <Button
        color='primary'
        onClick={() => hashHistory.push('/')}
        title='Close Exported products panel' >
        <Icon name={'times'} />
      </Button >
    </Row >;
  }
}

class TestProductsContainer extends Component {
  constructor (props) {
    super(props);
    this.publishTestProduct = this.publishTestProduct.bind(this);
    this.state = {
      testProductStatusOK: null,
      testProductStatusFail: null
    };
  }
  publishTestProduct () {
    const { urls } = this.props;
    const { BACKEND_SERVER_URL } = urls;
    this.setState({
      testProductStatusOK: 'Sending product ....',
      testProductStatusFail: null
    });
    axios({
      method: 'post',
      url: BACKEND_SERVER_URL + '/testproduct',
      withCredentials: true,
      data: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' }
    }).then(
      response => {
        if (response.data && response.data.message) {
          this.setState({
            testProductStatusOK: response.data.message,
            testProductStatusFail: null
          });
        } else {
          this.setState({
            testProductStatusOK: null,
            testProductStatusFail: 'Error: No data returned from server'
          });
        }
      }
    ).catch(error => {
      this.setState({
        testProductStatusOK: null,
        testProductStatusFail: '' + error
      });
    });
  }
  render () {
    return (
      <Col className='TestProductsContainer'>
        <Panel className='Panel' title={<ContainerHeader />} >
          <div className='TestProductsContainerContainer'>
            <div className='TestProductsPublisher'>
              <Row style={{ display:'flex' }}>
                <Col xs='2' style={{ display:'inline' }}>
                  <Button color='primary' onClick={() => { this.publishTestProduct(); }} >Publish test product</Button>
                </Col>
                <Col xs='4' style={{ display:'inline' }}>
                  { this.state.testProductStatusOK
                    ? <div><Alert color='success'>[OK] {this.state.testProductStatusOK}</Alert></div>
                    : null
                  }
                  { this.state.testProductStatusFail
                    ? <div><Alert color='danger'>{this.state.testProductStatusFail}</Alert></div>
                    : null
                  }
                </Col>
              </Row>
            </div>
            <div className='TestProductsExportedSection'>
              <ExportedProductsComponent urls={this.props.urls} />
            </div>
          </div>
        </Panel>
      </Col>
    );
  }
}

TestProductsContainer.propTypes = {
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};

export default TestProductsContainer;
