import React, { Component } from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';
import produce from 'immer';
import axios from 'axios';
import isEqual from 'lodash.isequal';

import Panel from '../../components/Panel';
import CollapseOmni from '../../components/CollapseOmni';
import { CATEGORY_REFS, INITIAL_STATE, LOCAL_ACTIONS } from './SigmetActions';
import dispatch from './SigmetReducers';

import ContainerHeader from '../../components/Sigmet/ContainerHeader';
import SigmetsCategory from '../../components/Sigmet/SigmetsCategory';
import MinifiedCategory from '../../components/Sigmet/MinifiedCategory';

const ERROR_MSG = {
  RETRIEVE_SIGMETS: 'Could not retrieve SIGMETs:',
  RETRIEVE_PARAMS: 'Could not retrieve SIGMET parameters',
  RETRIEVE_PHENOMENA: 'Could not retrieve SIGMET phenomena',
  FEATURE_ID_MISMATCH: 'GeoJson: the %s feature has a mutated id'
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
    this.findFeatureByFunction = this.findFeatureByFunction.bind(this);
    this.featureHasCoordinates = this.featureHasCoordinates.bind(this);
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
      this.localDispatch(LOCAL_ACTIONS.updateCategoryAction(ref, response.data.sigmets));
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
      this.localDispatch(LOCAL_ACTIONS.updateParametersAction(response.data));
      this.localDispatch(LOCAL_ACTIONS.addSigmetAction(CATEGORY_REFS.ADD_SIGMET));
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
      this.localDispatch(LOCAL_ACTIONS.updatePhenomenaAction(response.data));
      this.localDispatch(LOCAL_ACTIONS.addSigmetAction(CATEGORY_REFS.ADD_SIGMET));
    } else {
      console.error(ERROR_MSG.RETRIEVE_PARAMS, response.status, response.data);
    }
  }

  findFeatureByFunction (functionName, containerProperties = this.props) {
    if (containerProperties.drawProperties.adagucMapDraw.geojson.features) {
      return containerProperties.drawProperties.adagucMapDraw.geojson.features.find((feature) => feature.properties.featureFunction === functionName);
    }
    return null;
  }

  featureHasCoordinates (feature) {
    if (feature && feature.geometry && feature.geometry.coordinates &&
      Array.isArray(feature.geometry.coordinates)) { // shapes
      const coordinates = feature.geometry.coordinates;
      if (coordinates.length > 0 && Array.isArray(coordinates[0])) { // lines
        if (coordinates[0].length > 0 && Array.isArray(coordinates[0][0])) { // points
          if (coordinates[0][0].length === 2 && !isNaN(coordinates[0][0][0]) && !isNaN(coordinates[0][0][1])) { // lat-long coordinates
            return true;
          }
        }
      }
    }
    return false;
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.drawProperties.adagucMapDraw.geojson.features && this.props.drawProperties.adagucMapDraw.geojson.features) {
      const currentStartFeature = this.findFeatureByFunction('start');
      const currentEndFeature = this.findFeatureByFunction('end');
      const nextStartFeature = this.findFeatureByFunction('start', nextProps);
      const nextEndFeature = this.findFeatureByFunction('end', nextProps);
      if (!currentStartFeature || !nextStartFeature || currentStartFeature.id !== nextStartFeature.id) {
        console.warn(ERROR_MSG.FEATURE_ID_MISMATCH, 'start');
        return;
      }
      if (!currentEndFeature || !nextEndFeature || currentEndFeature.id !== nextEndFeature.id) {
        console.warn(ERROR_MSG.FEATURE_ID_MISMATCH, 'end');
        return;
      }
      if (!isEqual(currentStartFeature, nextStartFeature)) {
        this.localDispatch(LOCAL_ACTIONS.createFirIntersectionAction(nextStartFeature.id, nextProps.drawProperties.adagucMapDraw.geojson));
      }
      if (!isEqual(currentEndFeature, nextEndFeature)) {
        this.localDispatch(LOCAL_ACTIONS.createFirIntersectionAction(nextEndFeature.id, nextProps.drawProperties.adagucMapDraw.geojson));
      }
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
    const startFeature = this.props.drawProperties.adagucMapDraw.geojson.features.find((feature) => feature.properties.featureFunction === 'start');
    const endFeature = this.props.drawProperties.adagucMapDraw.geojson.features.find((feature) => feature.properties.featureFunction === 'end');
    const hasStartCoordinates = this.featureHasCoordinates(startFeature);
    const hasEndCoordinates = this.featureHasCoordinates(endFeature);

    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isContainerOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={header}>
            <Col xs='auto' className='accordionsWrapper' style={{ minWidth: this.state.isContainerOpen ? maxSize - 32 : 'unset' }}>
              { this.state.categories.map((category) => {
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
                    actions={LOCAL_ACTIONS}
                    phenomena={this.state.phenomena}
                    hasStartCoordinates={hasStartCoordinates}
                    hasEndCoordinates={hasEndCoordinates}
                    parameters={this.state.parameters} />
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
  }),
  drawProperties: PropTypes.shape({
    adagucMapDraw: PropTypes.shape({
      geojson: PropTypes.shape({
        features: PropTypes.array.isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

export default SigmetsContainer;
