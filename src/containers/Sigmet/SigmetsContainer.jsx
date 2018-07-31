import React, { Component } from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';
import produce from 'immer';
import isEqual from 'lodash.isequal';

import Panel from '../../components/Panel';
import CollapseOmni from '../../components/CollapseOmni';
import { CATEGORY_REFS, INITIAL_STATE, LOCAL_ACTIONS } from './SigmetActions';
import dispatch from './SigmetReducers';

import ContainerHeader from '../../components/Sigmet/ContainerHeader';
import SigmetsCategory from '../../components/Sigmet/SigmetsCategory';
import MinifiedCategory from '../../components/Sigmet/MinifiedCategory';

const ERROR_MSG = {
  FEATURE_ID_MISMATCH: 'GeoJson: the %s feature has a mutated id'
};

class SigmetsContainer extends Component {
  constructor (props) {
    super(props);
    this.localDispatch = this.localDispatch.bind(this);
    this.findFeatureByFunction = this.findFeatureByFunction.bind(this);
    this.featureHasCoordinates = this.featureHasCoordinates.bind(this);
    this.state = produce(INITIAL_STATE, draftState => {});
  }

  localDispatch (localAction) {
    dispatch(localAction, this);
  };

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
    this.localDispatch(LOCAL_ACTIONS.retrieveParametersAction());
    this.localDispatch(LOCAL_ACTIONS.retrievePhenomenaAction());
    this.localDispatch(LOCAL_ACTIONS.retrieveSigmetsAction());
  }

  render () {
    const maxSize = 520;
    const header = <ContainerHeader isContainerOpen={this.state.isContainerOpen} dispatch={this.localDispatch} actions={LOCAL_ACTIONS} />;
    const startFeature = this.props.drawProperties.adagucMapDraw.geojson.features.find((feature) => feature.properties.featureFunction === 'start');
    const startIntersectionFeature = this.props.drawProperties.adagucMapDraw.geojson.features.find((feature) =>
      feature.properties.featureFunction === 'intersection' && feature.properties.relatesTo === startFeature.id);
    const endFeature = this.props.drawProperties.adagucMapDraw.geojson.features.find((feature) => feature.properties.featureFunction === 'end');
    const hasStartCoordinates = this.featureHasCoordinates(startFeature);
    const hasStartIntersectionCoordinates = this.featureHasCoordinates(startIntersectionFeature);
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
                    tacs={this.state.tacs}
                    copiedSigmetRef={this.state.copiedSigmetRef}
                    hasEdits={this.state.focussedSigmet.hasEdits}
                    hasStartCoordinates={hasStartCoordinates}
                    hasStartIntersectionCoordinates={hasStartIntersectionCoordinates}
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
  drawProperties: PropTypes.shape({
    adagucMapDraw: PropTypes.shape({
      geojson: PropTypes.shape({
        features: PropTypes.array.isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

export default SigmetsContainer;
