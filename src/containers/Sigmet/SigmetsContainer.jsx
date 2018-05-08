import React, { Component } from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';
import produce from 'immer';
import axios from 'axios';

import Panel from '../../components/Panel';
import CollapseOmni from '../../components/CollapseOmni';
import { CATEGORY_REFS, INITIAL_STATE, LOCAL_ACTION_TYPES, LOCAL_ACTIONS } from './SigmetActions';
import { localDispatch as dispatch } from './SigmetReducers';

import ContainerHeader from '../../components/Sigmet/ContainerHeader';
import SigmetsCategory from '../../components/Sigmet/SigmetsCategory';
import MinifiedCategory from '../../components/Sigmet/MinifiedCategory';

const ERROR_MSG = {
  RETRIEVE_SIGMETS: 'Could not retrieve SIGMETs:',
  RETRIEVE_PARAMS: 'Could not retrieve SIGMET parameters',
  RETRIEVE_PHENOMENA: 'Could not retrieve SIGMET phenomena'
};

class SigmetsContainer extends Component {
  constructor (props) {
    super(props);
    this.localDispatch = this.localDispatch.bind(this);
    this.retrieveSigmets = this.retrieveSigmets.bind(this);
    this.receivedSigmetsCallback = this.receivedSigmetsCallback.bind(this);
    this.retrieveParameters = this.retrieveParameters.bind(this);
    this.receivedParametersCallback = this.receivedParametersCallback.bind(this);
    this.retrievePhenomena = this.retrievePhenomena.bind(this);
    this.receivedPhenomenaCallback = this.receivedPhenomenaCallback.bind(this);
    this.state = produce(INITIAL_STATE, draftState => {});
  }

  localDispatch (localAction) {
    dispatch(localAction, this);
  };

  retrieveSigmets () {
    const endpoint = `${this.props.urls.BACKEND_SERVER_URL}/sigmet/getsigmetlist`;

    let sigmets = [
      { ref: CATEGORY_REFS.ACTIVE_SIGMETS, urlSuffix: '?active=true' },
      { ref: CATEGORY_REFS.CONCEPT_SIGMETS, urlSuffix: '?active=false&status=PRODUCTION' },
      { ref: CATEGORY_REFS.ARCHIVED_SIGMETS, urlSuffix: '?active=false&status=CANCELLED' }
    ];
    sigmets.forEach((sigmet) => {
      axios({
        method: 'get',
        url: `${endpoint}${sigmet.urlSuffix}`,
        withCredentials: true,
        responseType: 'json'
      }).then(response => {
        this.receivedSigmetsCallback(sigmet.ref, response);
      }).catch(error => {
        console.error(ERROR_MSG.RETRIEVE_SIGMETS, sigmet.ref, error);
      });
    });
  }

  receivedSigmetsCallback (ref, response) {
    if (response.status === 200 && response.data) {
      if (response.data.nsigmets === 0 || !response.data.sigmets) {
        response.data.sigmets = [];
      }
      this.localDispatch({ type: LOCAL_ACTION_TYPES.UPDATE_CATEGORY, ref: ref, sigmets: response.data.sigmets });
    } else {
      console.error(ERROR_MSG.RETRIEVE_SIGMETS, ref, response.status, response.data);
    }
  }

  retrieveParameters () {
    const endpoint = `${this.props.urls.BACKEND_SERVER_URL}/sigmet/getsigmetparameters`;

    axios({
      method: 'get',
      url: endpoint,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      this.receivedParametersCallback(response);
    }).catch(error => {
      console.error(ERROR_MSG.RETRIEVE_PARAMS, error);
    });
  }

  receivedParametersCallback (response) {
    if (response.status === 200 && response.data) {
      this.localDispatch({ type: LOCAL_ACTION_TYPES.UPDATE_PARAMETERS, parameters: response.data });
      this.localDispatch({ type: LOCAL_ACTION_TYPES.ADD_SIGMET, ref: CATEGORY_REFS.ADD_SIGMET });
    } else {
      console.error(ERROR_MSG.RETRIEVE_PARAMS, response.status, response.data);
    }
  }

  retrievePhenomena () {
    const endpoint = `${this.props.urls.BACKEND_SERVER_URL}/sigmet/getsigmetphenomena`;

    axios({
      method: 'get',
      url: endpoint,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      this.receivedPhenomenaCallback(response);
    }).catch(error => {
      console.error(ERROR_MSG.RETRIEVE_PHENOMENA, error);
    });
  }

  receivedPhenomenaCallback (response) {
    if (response.status === 200 && response.data) {
      this.localDispatch({ type: LOCAL_ACTION_TYPES.UPDATE_PHENOMENA, phenomena: response.data });
      this.localDispatch({ type: LOCAL_ACTION_TYPES.ADD_SIGMET, ref: CATEGORY_REFS.ADD_SIGMET });
    } else {
      console.error(ERROR_MSG.RETRIEVE_PARAMS, response.status, response.data);
    }
  }

  componentDidMount () {
    this.retrieveParameters();
    this.retrievePhenomena();
    this.retrieveSigmets();
  }

  render () {
    const maxSize = 520;
    const header = <ContainerHeader isContainerOpen={this.state.isContainerOpen} dispatch={this.localDispatch} actions={LOCAL_ACTIONS} />;
    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isContainerOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={header}>
            <Col xs='auto' className='accordionsWrapper' style={{ minWidth: this.state.isContainerOpen ? maxSize - 32 : 'unset' }}>
              {this.state.categories.map((category) => {
                return this.state.isContainerOpen
                  ? <SigmetsCategory key={category.ref}
                    typeRef={category.ref}
                    title={category.title}
                    icon={category.icon}
                    isOpen={this.state.focussedCategoryRef === category.ref}
                    abilities={category.abilities}
                    sigmets={category.sigmets}
                    focussedSigmet={this.state.focussedSigmet}
                    dispatch={this.localDispatch}
                    actions={LOCAL_ACTIONS} />
                  : <MinifiedCategory key={category.ref}
                    icon={category.icon}
                    sigmetCount={(category.ref === CATEGORY_REFS.ADD_SIGMET) ? 0 : category.sigmets.length} />;
              })}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

SigmetsContainer.propTypes = {
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};

export default SigmetsContainer;
