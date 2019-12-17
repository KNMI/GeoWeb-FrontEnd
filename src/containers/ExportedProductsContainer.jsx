import React, { Component, PureComponent } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import Panel from '../components/Panel';
import { hashHistory } from 'react-router';
import PropTypes from 'prop-types';
import ExportedProductsComponent from '../components/ExportedProductsComponent';

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

class ExportedProductsContainer extends Component {
  render () {
    return (
      <Col className='ExportedProductsContainer'>
        <Panel className='Panel' title={<ContainerHeader />}>
          <ExportedProductsComponent urls={this.props.urls} />
        </Panel>
      </Col>
    );
  }
}

ExportedProductsContainer.propTypes = {
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};

export default ExportedProductsContainer;
