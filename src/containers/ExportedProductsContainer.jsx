import React, { Component, PureComponent } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import Panel from '../components/Panel';
import { hashHistory } from 'react-router';
import axios from 'axios';
import PropTypes from 'prop-types';

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
  constructor (props) {
    super(props);
    this.fetchExportedProductsList = this.fetchExportedProductsList.bind(this);
    this.fetchExportedProduct = this.fetchExportedProduct.bind(this);
    this.state = {
      exportedProductsList: [],
      selectedProduct: 'Please select a product from the list to display.',
      error: null,
      url: null
    };
  }
  fetchExportedProductsList () {
    const { urls } = this.props;
    const { BACKEND_SERVER_URL } = urls;
    this.setState({
      error: null,
      exportedProductsList: []
    });
    axios({
      method: 'get',
      url: BACKEND_SERVER_URL + '/exportedproducts/list',
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      this.setState({
        exportedProductsList: response.data,
        error: null
      });
    }).catch(error => {
      this.setState({
        exportedProductsList: [],
        error: error
      });
    });
  }
  fetchExportedProduct (id) {
    const { urls } = this.props;
    const { BACKEND_SERVER_URL } = urls;
    this.setState({
      error: null,
      selectedProduct: null,
      url:  BACKEND_SERVER_URL + '/exportedproducts/get?file=' + id
    });
    axios({
      method: 'get',
      url: BACKEND_SERVER_URL + '/exportedproducts/get?file=' + id,
      withCredentials: true
    }).then(response => {
      const typeOfProduct = typeof response.data;
      /* String products, like XML */
      if (typeOfProduct === 'string') {
        this.setState({
          selectedProduct: response.data
        });
      }
      /* Objects like json */
      if (typeOfProduct === 'object') {
        this.setState({
          selectedProduct: JSON.stringify(response.data, null, 2)
        });
      }
    }).catch(error => {
      this.setState({
        selectedProduct: null,
        error: error
      });
    });
  }
  componentDidMount () {
    this.fetchExportedProductsList();
  }
  render () {
    return (
      <Col className='ExportedProductsContainer'>
        <Panel className='Panel' title={<ContainerHeader />}>
          { this.state.error ? (<div><h1>Error</h1><hr /><pre>{JSON.stringify(this.state.error, null, 2)}</pre></div>)
            : <div className='Container'>
              <div className='ExportedProductsListHeader'>
                <Button color='link' style={{ display:'contents' }} onClick={this.fetchExportedProductsList}><Icon name='refresh' /></Button>
              </div>
              <div className='ExportedProductsList'>
                { this.state.exportedProductsList.length === 0 ? 'There are no exported products.'
                  : <ul>{
                    this.state.exportedProductsList.map((product, key) => {
                      return (<li onClick={() => { this.fetchExportedProduct(product); }} className='SelectableProduct' key={key}>{product}</li>);
                    })
                  }
                  </ul>
                }
              </div>
              <div className='ExportedProductsViewerHeader'>
                <a target='_blank' href={this.state.url}>Open in new tab</a>
              </div>
              <div className='ExportedProductsViewer'>
                <pre>
                  { this.state.selectedProduct }
                </pre>
              </div>
            </div>
          }
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
